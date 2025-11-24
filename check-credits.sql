-- Check user credit balance
SELECT 
  id,
  display_name,
  credit_balance,
  created_at
FROM user_profile
ORDER BY created_at DESC
LIMIT 5;
