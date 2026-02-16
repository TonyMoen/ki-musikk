-- Lyrics Rate Limit Tracking
-- Tracks lyrics generation/optimization requests for rate limiting
-- Anonymous users: 3 per 24h per IP | Logged-in users: 30 per hour

CREATE TABLE lyrics_rate_limit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL,
  endpoint TEXT NOT NULL CHECK (endpoint IN ('generate', 'optimize')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Anonymous rate limit queries: IP + time window
CREATE INDEX idx_lyrics_rl_ip
  ON lyrics_rate_limit(ip_address, created_at DESC)
  WHERE user_id IS NULL;

-- Authenticated rate limit queries: user_id + time window
CREATE INDEX idx_lyrics_rl_user
  ON lyrics_rate_limit(user_id, created_at DESC)
  WHERE user_id IS NOT NULL;
