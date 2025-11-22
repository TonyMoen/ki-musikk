/**
 * Supabase Browser Client
 *
 * This client is used in React Client Components for browser-side operations.
 * It uses the NEXT_PUBLIC_SUPABASE_ANON_KEY which is safe for client-side code
 * because Row Level Security (RLS) enforces data access policies.
 *
 * Usage:
 * ```typescript
 * import { createClient } from '@/lib/supabase/client';
 *
 * const supabase = createClient();
 * const { data, error } = await supabase.from('songs').select('*');
 * ```
 *
 * Security:
 * - Uses anonymous key (NEXT_PUBLIC_SUPABASE_ANON_KEY) which is safe for browser
 * - RLS policies automatically enforce user-specific data access
 * - Never uses SUPABASE_SERVICE_ROLE_KEY (server-only key)
 */

import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
