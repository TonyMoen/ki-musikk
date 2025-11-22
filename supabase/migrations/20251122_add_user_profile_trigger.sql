-- =====================================================
-- Auto-create user_profile on new user signup
-- Fixes: Missing user_profile records after Google OAuth
-- Date: 2025-11-22
-- =====================================================

-- Function to create user_profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profile (id, display_name, credit_balance)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user_profile on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user IS 'Automatically creates user_profile record when new user signs up via Google OAuth or other auth methods';
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Auto-creates user_profile with 0 credits for new users';
