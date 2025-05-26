"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client"; // Adjust path
import type { User } from "@supabase/supabase-js";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<{ username: string | null, emoji: string | null } | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        // Fetch public profile data
        const { data: profile, error: profileError } = await supabase
          .from('User') // Your public User table
          .select('username, emoji')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setUserProfile(profile);
        } else if (profileError) {
          console.warn("Error fetching user profile:", profileError.message);
        }

      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setLoading(true);
        if (session?.user) {
          setUser(session.user);
          const { data: profile, error: profileError } = await supabase
            .from('User')
            .select('username, emoji')
            .eq('id', session.user.id)
            .single();
          if (profile) setUserProfile(profile);
          else if (profileError) console.warn("Error fetching user profile on auth change:", profileError.message);
        } else {
          setUser(null);
          setUserProfile(null);
        }
        setLoading(false);
        router.refresh(); // Refresh server components that might depend on auth state
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserProfile(null);
    router.push('/'); // Or to sign-in page
    router.refresh();
  };

  if (loading) {
    // Optional: Render a loading state for the header or parts of it
    // For simplicity, we'll just let it render the conditional parts which will be empty/default.
  }


  return (
    <header className="glass-dark rounded-b-[var(--zwarm-radius)] p-4 relative z-20">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-[var(--zwarm-yellow)] rounded-full flex items-center justify-center text-3xl shadow-[var(--zwarm-shadow-glow)] border-3 border-[#fffbe6] transition-transform group-hover:rotate-[-10deg] group-hover:scale-110">
            🐝
          </div>
          <span className="text-3xl font-black tracking-tight text-white">zwarm</span>
        </Link>

        <nav className="flex items-center gap-4 md:gap-8"> {/* Adjusted gap for responsiveness */}
          <Link
            href="/"
            className={`text-lg font-bold transition-colors ${
              pathname === "/"
                ? "text-[var(--zwarm-yellow)] text-glow-yellow border-b-2 border-[var(--zwarm-yellow)]"
                : "text-white hover:text-[var(--zwarm-yellow)]"
            }`}
          >
            Home
          </Link>
          <Link
            href="/missions" // Assuming you'll create this page
            className={`text-lg font-bold transition-colors ${
              pathname.startsWith("/missions") // Use startsWith for active state on sub-paths
                ? "text-[var(--zwarm-yellow)] text-glow-yellow border-b-2 border-[var(--zwarm-yellow)]"
                : "text-white hover:text-[var(--zwarm-yellow)]"
            }`}
          >
            Missions
          </Link>
          {/* Placeholder for "Start a Mission", to be enabled when user is logged in */}
           <Button
              variant="ghost"
              className={`text-lg font-bold ${user ? "text-white hover:text-[var(--zwarm-yellow)]" : "text-white/50 cursor-not-allowed"}`}
              disabled={!user}
              onClick={() => user && router.push('/missions/new')} // Example route
            >
              Start a Mission
            </Button>

          {user && userProfile ? (
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => router.push('/profile')} className="group flex items-center gap-2 p-2 rounded-full hover:bg-gray-800 transition-colors">
                 <span className="text-2xl bg-gray-700 p-1.5 rounded-full group-hover:bg-yellow-500 transition-colors">{userProfile.emoji || '😀'}</span>
                 <span className="text-white font-medium group-hover:text-yellow-400 transition-colors">{userProfile.username || user.email}</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="text-white border-gray-700 hover:bg-gray-800 hover:border-gray-600"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => router.push('/sign-in')}
                className="text-lg font-bold text-white hover:text-[var(--zwarm-yellow)]"
              >
                Sign In
              </Button>
               {/* You might want to hide Sign Up if they are on the sign-up page already */}
              {pathname !== '/sign-up' && (
                <Button
                  variant="outline"
                  onClick={() => router.push('/sign-up')}
                  className="text-lg font-bold border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black transition-all"
                >
                  Sign Up
                </Button>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}