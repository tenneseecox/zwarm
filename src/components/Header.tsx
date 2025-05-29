"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserCircle, LogOut, LayoutDashboard, Settings, ChevronDown } from 'lucide-react';

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
    <header className="glass-dark rounded-b-[var(--zwarm-radius)] p-4 relative z-20 border-b border-yellow-500/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center text-3xl shadow-zwarm-glow border-2 border-yellow-100 transition-all duration-300 group-hover:rotate-[-10deg] group-hover:scale-110">
            🐝
          </div>
          <span className="text-3xl font-black tracking-tight bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">zwarm</span>
        </Link>

        <nav className="flex items-center gap-4 md:gap-8">
          <Link
            href="/"
            className={`text-lg font-bold transition-all duration-300 ${
              pathname === "/"
                ? "text-yellow-400 text-glow-yellow border-b-2 border-yellow-500"
                : "text-white hover:text-yellow-400 hover:border-b-2 hover:border-yellow-500/50"
            }`}
          >
            Home
          </Link>
          <Link
            href="/missions"
            className={`text-lg font-bold transition-all duration-300 ${
              pathname.startsWith("/missions")
                ? "text-yellow-400 text-glow-yellow border-b-2 border-yellow-500"
                : "text-white hover:text-yellow-400 hover:border-b-2 hover:border-yellow-500/50"
            }`}
          >
            Missions
          </Link>

          <Link 
            href="/dashboard" 
            className={`text-lg font-bold transition-all duration-300 ${
              pathname.startsWith("/dashboard")
                ? "text-yellow-400 text-glow-yellow border-b-2 border-yellow-500"
                : "text-white hover:text-yellow-400 hover:border-b-2 hover:border-yellow-500/50"
            }`}
          >
            Dashboard
          </Link>

          <Button
            variant="ghost"
            className={`text-lg font-bold transition-all duration-300 ${
              user 
                ? "text-white hover:text-yellow-400 hover:bg-yellow-500/10" 
                : "text-white/50 cursor-not-allowed"
            }`}
            disabled={!user}
            onClick={() => user && router.push('/missions/new')}
          >
            Start a Mission
          </Button>

          {loading ? (
            <div className="h-9 w-24 bg-black-800/50 animate-pulse rounded-xl"></div>
          ) : user && userProfile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="group flex items-center gap-2 p-2 rounded-xl hover:bg-yellow-500/10 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-yellow-400"
                >
                  <span className="text-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 p-1.5 rounded-xl group-hover:scale-110 transition-all duration-300 shadow-zwarm-glow border border-yellow-100">
                    {userProfile.emoji || '😀'}
                  </span>
                  <span className="text-white font-medium group-hover:text-yellow-400 transition-colors hidden sm:inline">
                    {userProfile.username || user.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-yellow-400 transition-colors" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-56 glass-dark border-yellow-500/10 text-white shadow-zwarm-dark" 
                align="end"
              >
                <DropdownMenuLabel className="text-gray-400">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-yellow-500/10"/>
                <DropdownMenuItem asChild className="hover:bg-yellow-500/10 cursor-pointer transition-colors duration-300">
                  <Link href={`/profile/${user.id}`} className="flex items-center">
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>View Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="hover:bg-yellow-500/10 cursor-pointer transition-colors duration-300">
                  <Link href="/dashboard" className="flex items-center">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="hover:bg-yellow-500/10 cursor-pointer transition-colors duration-300">
                  <Link href="/profile/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-yellow-500/10"/>
                <DropdownMenuItem 
                  onClick={handleSignOut} 
                  className="text-red-400 hover:bg-red-500/20 hover:text-red-300 cursor-pointer focus:bg-red-500/20 focus:text-red-300 transition-colors duration-300"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button 
                variant="ghost" 
                onClick={() => router.push('/sign-in')} 
                className="text-lg font-bold text-white hover:text-yellow-400 hover:bg-yellow-500/10 transition-all duration-300"
              >
                Sign In
              </Button>
              {pathname !== '/sign-up' && (
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/sign-up')} 
                  className="text-lg font-bold border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black transition-all duration-300"
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