"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<{ username: string | null, emoji: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile data
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('User')
        .select('username, emoji')
        .eq('id', userId)
        .single();

      if (profile) {
        setUserProfile(profile);
      } else if (profileError) {
        console.warn("Error fetching user profile:", profileError.message);
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        setLoading(true);
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          if (session?.user) {
            setUser(session.user);
            await fetchUserProfile(session.user.id);
          } else {
            setUser(null);
            setUserProfile(null);
          }
        }
      } catch (error) {
        console.error("Error in initializeAuth:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          setLoading(true);
          try {
            if (session?.user) {
              setUser(session.user);
              await fetchUserProfile(session.user.id);
            } else {
              setUser(null);
              setUserProfile(null);
            }
          } catch (error) {
            console.error("Error in auth state change:", error);
          } finally {
            setLoading(false);
            router.refresh(); // Refresh server components
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setUserProfile(null);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="glass-dark rounded-b-[var(--zwarm-radius)] p-4 relative z-20">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-[var(--zwarm-yellow)] rounded-full flex items-center justify-center text-3xl shadow-[var(--zwarm-shadow-glow)] border-3 border-[#fffbe6] transition-transform group-hover:rotate-[-10deg] group-hover:scale-110">
            🐝
          </div>
          <span className="text-3xl font-black tracking-tight text-white">zwarm</span>
        </Link>

        <nav className="flex items-center gap-4 md:gap-8">
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
            href="/missions"
            className={`text-lg font-bold transition-colors ${
              pathname.startsWith("/missions")
                ? "text-[var(--zwarm-yellow)] text-glow-yellow border-b-2 border-[var(--zwarm-yellow)]"
                : "text-white hover:text-[var(--zwarm-yellow)]"
            }`}
          >
            Missions
          </Link>

          <Link 
            href="/dashboard" 
            className={`text-lg font-bold transition-colors ${
              pathname.startsWith("/dashboard")
                ? "text-[var(--zwarm-yellow)] text-glow-yellow border-b-2 border-[var(--zwarm-yellow)]"
                : "text-white hover:text-[var(--zwarm-yellow)]"
            }`}
          >
            Dashboard
          </Link>

          <Button
            variant="ghost"
            className={`text-lg font-bold ${user ? "text-white hover:text-[var(--zwarm-yellow)]" : "text-white/50 cursor-not-allowed"}`}
            disabled={!user}
            onClick={() => user && router.push('/missions/new')}
          >
            Start a Mission
          </Button>

          {!loading && (
            <>
              {user && userProfile ? (
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    onClick={() => router.push('/profile')} 
                    className="group flex items-center gap-2 p-2 rounded-full hover:bg-gray-800 transition-colors"
                  >
                    <span className="text-2xl bg-gray-700 p-1.5 rounded-full group-hover:bg-yellow-500 transition-colors">
                      {userProfile.emoji || '😀'}
                    </span>
                    <span className="text-white font-medium group-hover:text-yellow-400 transition-colors">
                      {userProfile.username || user.email}
                    </span>
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
            </>
          )}
        </nav>
      </div>
    </header>
  );
}