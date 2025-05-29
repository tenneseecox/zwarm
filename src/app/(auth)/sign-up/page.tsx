"use client";

// Make sure this path correctly points to your Supabase browser client initialization function
// e.g., import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { createClient } from "@/utils/supabase/client"; // Using your path for now
import { getAbsoluteUrl } from '@/utils/site-url';

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from 'react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SwarmBackground } from '@/components/SwarmBackground';

export default function SignUp() {
  const router = useRouter();
  // const supabase = createClient(); // Initialize once, or as needed if createClient is lightweight.
                                  // If createClient is just a function call, it's fine here.
                                  // Or initialize it inside handleSignUp if it's more complex.

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('😀');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setSelectedEmoji(emojiData.emoji);
    setShowEmojiPicker(false);
  };

const handleSignUp = async () => {
  if (!email || !password || !username) {
    toast.error("Please fill in all required fields (email, password, username).");
    return;
  }
  if (password.length < 6) {
    toast.error("Password must be at least 6 characters long.");
    return;
  }

  setIsLoading(true);
  const supabase = createClient();

  try {
    // Check username availability
    const { data: existingUserByUsername, error: usernameCheckError } = await supabase
      .from('User')
      .select('username')
      .eq('username', username)
      .maybeSingle();

    if (usernameCheckError && usernameCheckError.code !== 'PGRST116') {
      console.error("Username check error:", usernameCheckError);
      toast.error("Error checking username availability");
      return;
    }

    if (existingUserByUsername) {
      toast.error("Username is already taken. Please choose another.");
      return;
    }

    // Prepare metadata for the trigger
    const userMetadata = {
      username: username,
      emoji: selectedEmoji
    };

    console.log("Attempting sign up with metadata:", userMetadata);

    // Create the user in Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getAbsoluteUrl('/callback'),
        data: userMetadata
      },
    });

    if (signUpError) {
      console.error("Sign up error:", signUpError);
      toast.error(signUpError.message);
      return;
    }

    if (!authData?.user) {
      console.error("No user data returned from sign up");
      toast.error("Failed to create account. Please try again.");
      return;
    }

    toast.success("Sign-up successful! Check your email for the confirmation link.");
    router.push("/sign-in");

  } catch (err: unknown) {
    console.error("Sign up error:", err);
    toast.error(err instanceof Error ? err.message : "An unexpected error occurred during sign up.");
  } finally {
    setIsLoading(false);
  }
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
                Join the Swarm
              </h1>
              <p className="text-gray-400">Create your account to start your mission.</p>
            </div>

            <div className="space-y-6">
              {/* Username Input */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your cool username"
                  className="bg-black-800/50 border-yellow-500/20 focus:border-yellow-500/40 focus:ring-yellow-500/20 rounded-xl"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="bg-black-800/50 border-yellow-500/20 focus:border-yellow-500/40 focus:ring-yellow-500/20 rounded-xl"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••• (min. 6 characters)"
                  className="bg-black-800/50 border-yellow-500/20 focus:border-yellow-500/40 focus:ring-yellow-500/20 rounded-xl"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Emoji Picker Section */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Choose your Profile Emoji</label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-3 border-yellow-500/20 hover:bg-yellow-500/10 rounded-xl transition-all duration-300"
                    type="button"
                    disabled={isLoading}
                  >
                    <span className="text-2xl">{selectedEmoji}</span>
                  </Button>
                  <span className="text-gray-400 text-sm">Your profile emoji</span>
                </div>
                {showEmojiPicker && (
                  <div className="mt-2 absolute z-20 bg-black-900 rounded-xl shadow-xl border border-yellow-500/20">
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      theme={Theme.DARK}
                      width="100%"
                      lazyLoadEmojis={true}
                    />
                  </div>
                )}
              </div>

              <Button
                onClick={handleSignUp}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black-950 font-bold py-3 text-lg rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-zwarm-glow"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Sign Up"}
              </Button>

              <p className="text-center text-sm text-gray-400">
                Already have an account?{' '}
                <Link href="/sign-in" className="font-medium text-yellow-400 hover:text-yellow-300 transition-colors duration-300">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}