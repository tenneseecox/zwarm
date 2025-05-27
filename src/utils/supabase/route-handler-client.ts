// src/lib/supabase/route-handler-client.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createSupabaseRouteHandlerClient = async () => {
  const cookieStore = await cookies(); // Use 'await' if cookies() is async in your setup
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // If you are using Next.js App Router, server-side cookies are read-only.
          // Consider if you need to set cookies here or if auth is handled by middleware.
          // For read-only scenarios in Route Handlers, this set might not be effective or needed
          // if you're only reading auth state.
          // However, Supabase examples often include it for completeness.
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Supabase's docs mention this can be a no-op in Route Handlers if read-only
            console.warn('SupabaseRouteHandlerClient: Failed to set cookie (expected in Route Handlers if read-only)', name, error);
          }
        },
        remove(name: string, options: CookieOptions) {
           try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            console.warn('SupabaseRouteHandlerClient: Failed to remove cookie (expected in Route Handlers if read-only)', name, error);
          }
        },
      },
    }
  );
};