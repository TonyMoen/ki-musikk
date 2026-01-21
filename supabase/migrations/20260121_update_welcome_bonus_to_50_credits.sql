-- Migration: Increase welcome bonus credits from 24 to 50
-- Purpose: New users now receive 50 credits (5 free songs) instead of 24 (2 songs)

-- Welcome bonus: 50 credits = 5 free songs (10 credits per song)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_new_user IS 'Automatically creates user_profile with 50 welcome bonus credits and records signup_bonus transaction when new user signs up';
