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
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4 glass-dark p-8 rounded-zwarm"> {/* Your custom styling */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Create Zwarm Account</h1>
          <p className="text-gray-400">Join the swarm!</p>
        </div>

        {/* Username Input */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">Username</label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your cool username"
            className="bg-black-900 border-gray-700 text-white placeholder-gray-500" // Example styling
            required
            disabled={isLoading}
          />
        </div>

        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="bg-black-900 border-gray-700 text-white placeholder-gray-500"
            required
            disabled={isLoading}
          />
        </div>

        {/* Password Input */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="•••••••• (min. 6 characters)"
            className="bg-black-900 border-gray-700 text-white placeholder-gray-500"
            required
            disabled={isLoading}
          />
        </div>

        {/* Emoji Picker Section */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Choose your Profile Emoji</label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="border-gray-700 hover:bg-gray-800 text-white"
              type="button" // Important to prevent form submission if this was in a <form>
              disabled={isLoading}
            >
              <span className="text-2xl">{selectedEmoji}</span>
            </Button>
            <span className="text-gray-400 text-sm">Your profile emoji</span>
          </div>
          {showEmojiPicker && (
            <div className="mt-2 absolute z-10 bg-black-900 rounded-lg shadow-xl"> {/* Added some basic styling for picker container */}
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
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black-950 font-bold"
          disabled={isLoading}
        >
          {isLoading ? "Creating Account..." : "Sign Up"}
        </Button>

        <p className="text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link href="/sign-in" className="font-medium text-yellow-400 hover:underline"> {/* Use Next.js Link */}
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}