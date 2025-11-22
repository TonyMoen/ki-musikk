/**
 * Supabase Server Client
 *
 * This client is used in Server Components, API routes, and server-side operations.
 * It automatically manages authentication context from cookies and enforces Row Level Security.
 *
 * Usage in Server Component:
 * ```typescript
 * import { createClient } from '@/lib/supabase/server';
 *
 * const supabase = await createClient();
 * const { data, error } = await supabase.from('songs').select('*');
 * ```
 *
 * Usage in API Route:
 * ```typescript
 * import { createClient } from '@/lib/supabase/server';
 *
 * export async function GET(request: Request) {
 *   const supabase = await createClient();
 *   const { data } = await supabase.from('songs').select('*');
 *   return Response.json(data);
 * }
 * ```
 *
 * Security:
 * - Automatically applies RLS based on auth.uid() from session cookies
 * - Uses NEXT_PUBLIC_SUPABASE_ANON_KEY (not service role key)
 * - Session management handled via cookies
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
