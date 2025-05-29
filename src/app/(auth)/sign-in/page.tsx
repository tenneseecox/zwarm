"use client";

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SwarmBackground } from '@/components/SwarmBackground';
import Link from 'next/link';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Signed in successfully!");
      router.push('/');
      router.refresh();
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-black-950 text-white">
      <SwarmBackground />
      <main className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="glass-dark rounded-2xl p-8 shadow-zwarm-dark border border-yellow-500/10 hover:border-yellow-500/20 transition-all duration-300">
            <div className="text-center mb-8">
              <div className="text-4xl bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-4 w-16 h-16 mx-auto mb-6 shadow-zwarm-glow border-2 border-yellow-100 transform hover:scale-105 transition-transform duration-300 flex items-center justify-center text-black font-black">
                🐝
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-400">Sign in to continue your mission.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="bg-black-800/50 border-yellow-500/20 focus:border-yellow-500/40 focus:ring-yellow-500/20 rounded-xl"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-black-800/50 border-yellow-500/20 focus:border-yellow-500/40 focus:ring-yellow-500/20 rounded-xl"
                  disabled={isLoading}
                />
              </div>

              <Button
                onClick={handleSignIn}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black-950 font-bold py-3 text-lg rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-zwarm-glow"
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>

              <p className="text-center text-sm text-gray-400">
                Don&apos;t have an account?{' '}
                <Link href="/sign-up" className="font-medium text-yellow-400 hover:text-yellow-300 transition-colors duration-300">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}