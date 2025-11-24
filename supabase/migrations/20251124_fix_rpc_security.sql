-- Fix RPC functions to use SECURITY DEFINER
-- This allows the functions to bypass RLS when inserting credit transactions
-- Story 3.5: Fix credit deduction RLS issue

-- =====================================================
-- 1. Fix deduct_credits function
-- =====================================================

CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_song_id UUID DEFAULT NULL
) RETURNS credit_transaction
LANGUAGE plpgsql
SECURITY DEFINER  -- This is the key fix!
AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
  v_transaction credit_transaction;
BEGIN
  -- Lock user profile row
  SELECT credit_balance INTO v_current_balance
  FROM user_profile
  WHERE id = p_user_id
  FOR UPDATE;

  -- Validate sufficient credits
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits: have %, need %', v_current_balance, p_amount;
  END IF;

  -- Calculate new balance
  v_new_balance := v_current_balance - p_amount;

  -- Update user balance
  UPDATE user_profile
  SET credit_balance = v_new_balance,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- Record transaction
  INSERT INTO credit_transaction (user_id, amount, balance_after, transaction_type, description, song_id)
  VALUES (p_user_id, -p_amount, v_new_balance, 'deduction', p_description, p_song_id)
  RETURNING * INTO v_transaction;

  RETURN v_transaction;
END;
$$;

COMMENT ON FUNCTION deduct_credits IS 'Atomically deduct credits with validation, row locking, and audit trail. Uses SECURITY DEFINER to bypass RLS.';

-- =====================================================
-- 2. Create refund_credits function if not exists
-- =====================================================

CREATE OR REPLACE FUNCTION refund_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_song_id UUID DEFAULT NULL
) RETURNS credit_transaction
LANGUAGE plpgsql
SECURITY DEFINER  -- Bypass RLS
AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
  v_transaction credit_transaction;
BEGIN
  -- Lock user profile row
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

  -- Record refund transaction
  INSERT INTO credit_transaction (user_id, amount, balance_after, transaction_type, description, song_id)
  VALUES (p_user_id, p_amount, v_new_balance, 'refund', p_description, p_song_id)
  RETURNING * INTO v_transaction;

  RETURN v_transaction;
END;
$$;

COMMENT ON FUNCTION refund_credits IS 'Atomically refund credits to user account. Uses SECURITY DEFINER to bypass RLS.';

-- =====================================================
-- 3. Grant EXECUTE permissions to authenticated users
-- =====================================================

GRANT EXECUTE ON FUNCTION deduct_credits(UUID, INTEGER, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION refund_credits(UUID, INTEGER, TEXT, UUID) TO authenticated;

-- =====================================================
-- Migration Complete
-- =====================================================

COMMENT ON SCHEMA public IS 'Story 3.5 fix: Added SECURITY DEFINER to RPC functions to allow credit transaction inserts through RLS';
