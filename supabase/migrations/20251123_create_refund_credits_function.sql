-- =====================================================
-- Refund Credits Stored Procedure
-- Date: 2025-11-23
-- Description: Atomically refund credits when song generation fails
-- Used for automatic rollback without database transaction rollback
-- =====================================================

CREATE OR REPLACE FUNCTION refund_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_song_id UUID DEFAULT NULL
) RETURNS credit_transaction AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
  v_transaction credit_transaction;
BEGIN
  -- Lock user profile row to prevent race conditions
  SELECT credit_balance INTO v_current_balance
  FROM user_profile
  WHERE id = p_user_id
  FOR UPDATE;

  -- Calculate new balance (add credits back)
  v_new_balance := v_current_balance + p_amount;

  -- Update user balance
  UPDATE user_profile
  SET credit_balance = v_new_balance,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- Record refund transaction (positive amount)
  INSERT INTO credit_transaction (user_id, amount, balance_after, transaction_type, description, song_id)
  VALUES (p_user_id, p_amount, v_new_balance, 'refund', p_description, p_song_id)
  RETURNING * INTO v_transaction;

  RETURN v_transaction;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION refund_credits IS 'Atomically refund credits with row locking and audit trail (compensating transaction)';

-- =====================================================
-- Migration Complete
-- This function is called when:
-- 1. Song generation API fails after credit deduction
-- 2. User requests manual refund (future feature)
-- 3. Any other credit refund scenario
-- =====================================================
