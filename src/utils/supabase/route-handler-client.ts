// src/utils/supabase/route-handler-client.ts (or your actual path)
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createSupabaseRouteHandlerClient = async () => { // Keep async if your cookies() setup requires it
  const cookieStore = await cookies(); // cookies() from next/headers is typically synchronous

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            // This may not be effective in all Route Handler contexts (e.g., GET if read-only),
            // but the Supabase client expects these methods to be present.
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            console.warn(`SupabaseRouteHandlerClient: Error setting cookie "${name}". This might be expected in a read-only context.`, error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            // Similar to set, this might not be effective in all contexts.
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            console.warn(`SupabaseRouteHandlerClient: Error removing cookie "${name}". This might be expected in a read-only context.`, error);
          }
        },
      },
    }
  );
};