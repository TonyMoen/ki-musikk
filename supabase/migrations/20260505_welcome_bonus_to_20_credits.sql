-- Migration: Reduce welcome bonus credits from 50 to 20
-- Purpose: New users now receive 20 credits (2 free songs) — matches the
-- "Du får 2 gratis sanger ved registrering!" copy on the landing page.
-- Each generation costs 10 credits and produces 2 song variants, so 2 free
-- generations = 4 audio files in the user's library.
--
-- Welcome bonus: 20 credits = 2 free songs (10 credits per song)
-- This only affects users who sign up AFTER this migration runs. Existing
-- accounts keep whatever balance they currently have — no retroactive changes.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  welcome_bonus_credits INTEGER := 20;
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
    'Velkomstbonus - 2 gratis sanger'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION public.handle_new_user IS 'Automatically creates user_profile with 20 welcome bonus credits and records signup_bonus transaction when new user signs up';
