-- Fix Supabase security warnings:
-- 1. RLS on lyrics_rate_limit (server-only table, no policies needed)
-- 2. Set search_path on functions missing it (prevents search_path hijacking)

-- =====================================================
-- 1. Enable RLS on lyrics_rate_limit
-- =====================================================

ALTER TABLE lyrics_rate_limit ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. Fix handle_new_user — add SET search_path
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  welcome_bonus_credits INTEGER := 50;
BEGIN
  -- Create user profile with welcome bonus credits
  INSERT INTO public.user_profile (id, display_name, credit_balance)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    welcome_bonus_credits
  );

  -- Record the signup bonus transaction for audit trail
  INSERT INTO public.credit_transaction (user_id, amount, balance_after, transaction_type, description)
  VALUES (
    NEW.id,
    welcome_bonus_credits,
    welcome_bonus_credits,
    'signup_bonus',
    'Velkomstbonus - 5 gratis sanger'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- 3. Fix update_vipps_payment_updated_at — add SET search_path
-- =====================================================

CREATE OR REPLACE FUNCTION update_vipps_payment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- =====================================================
-- 4. Re-apply deduct_credits with search_path (ensure current)
-- =====================================================

CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_song_id UUID DEFAULT NULL
) RETURNS credit_transaction
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
  v_transaction credit_transaction;
BEGIN
  SELECT credit_balance INTO v_current_balance
  FROM user_profile
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits: have %, need %', v_current_balance, p_amount;
  END IF;

  v_new_balance := v_current_balance - p_amount;

  UPDATE user_profile
  SET credit_balance = v_new_balance,
      updated_at = NOW()
  WHERE id = p_user_id;

  INSERT INTO credit_transaction (user_id, amount, balance_after, transaction_type, description, song_id)
  VALUES (p_user_id, -p_amount, v_new_balance, 'deduction', p_description, p_song_id)
  RETURNING * INTO v_transaction;

  RETURN v_transaction;
END;
$$;
