// src/app/auth/callback/route.ts

import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers'; // Import cookies
import { createServerClient, type CookieOptions } from '@supabase/ssr'; // Import createServerClient

// Helper function to create Supabase server client for Route Handlers
// This is similar to the one in src/lib/supabase/server.ts but adapted for Route Handlers
// if you haven't centralized it yet.
const createSupabaseRouteHandlerClient = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
};


export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in param, use it as the redirect URL
  // (useful if you want to redirect to a specific page after confirmation)
  const next = searchParams.get('next') ?? '/'; // Default to homepage

  if (code) {
    const supabase = await createSupabaseRouteHandlerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Successfully exchanged code for session.
      // The session is now set in the cookies by the Supabase client.
      // The middleware will pick this up on the next request to the redirect target.
      return NextResponse.redirect(`${origin}${next}`);
    } else {
      console.error('Auth callback error exchanging code:', error.message);
      // Redirect to an error page or show an error message
      // You might want to create a specific error page for auth issues
      return NextResponse.redirect(`${origin}/auth/auth-error?message=${encodeURIComponent(error.message)}`);
    }
  }

  // If no code is present, or other issues occur before exchanging code
  console.error('Auth callback: No code found in URL.');
  return NextResponse.redirect(`${origin}/auth/auth-error?message=Authorization%20code%20missing.`);
}