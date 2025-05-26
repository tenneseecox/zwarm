"use client";

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client'; // Adjust path if needed
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';


export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Signed in successfully!");
      router.push('/'); // Redirect to home page or dashboard
      router.refresh(); // Important to re-fetch server components that depend on auth state
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4 glass-dark p-8 rounded-zwarm">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Welcome Back to Zwarm</h1>
          <p className="text-gray-400">Sign in to continue.</p>
        </div>
         <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                   className="bg-black-900 border-gray-700 text-white placeholder-gray-500"/>
         </div>
         <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                   className="bg-black-900 border-gray-700 text-white placeholder-gray-500"/>
         </div>
        <Button onClick={handleSignIn} className="w-full bg-yellow-500 hover:bg-yellow-600 text-black-950 font-bold">
          Sign In
        </Button>
        <p className="text-center text-sm text-gray-400">
          Don&apos;t have an account?{' '}
          <a href="/sign-up" className="font-medium text-yellow-400 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}