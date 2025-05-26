// src/app/missions/new/page.tsx
"use client";

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button'; //
import { Input } from '@/components/ui/input'; // Assuming you have this from Shadcn
import { Textarea } from '@/components/ui/textarea'; // Assuming you have this from Shadcn
import { createClient } from '@/utils/supabase/client'; // Adjust path as needed
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { Header } from '@/components/Header'; //
import { SwarmBackground } from '@/components/SwarmBackground'; //

export default function CreateMissionPage() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🎯'); // Default mission emoji
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in to create a mission.");
        router.push('/sign-in'); // Redirect to sign-in if not authenticated
      } else {
        setIsAuthenticated(true);
      }
    };
    checkAuth();
  }, [supabase, router]);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setSelectedEmoji(emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title || !description) {
      toast.error("Please fill in all required fields (title and description).");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/missions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          emoji: selectedEmoji,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || `Failed to create mission (HTTP ${response.status})`);
      } else {
        toast.success("Mission created successfully!");
        router.push(`/missions/${result.id}`); // Redirect to the new mission's detail page
      }
    } catch (error) {
      console.error("Error submitting mission:", error);
      toast.error("An unexpected error occurred while creating the mission.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    // You can show a loading spinner or null while auth check is happening
    // or if redirecting.
    return (
        <div className="min-h-screen bg-black-950 flex flex-col items-center justify-center text-white">
            <SwarmBackground />
            <p>Loading and checking authentication...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-black-950 text-white">
      <SwarmBackground />
      <Header />
      <main className="relative z-10 container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-2xl mx-auto glass-dark p-6 md:p-8 rounded-zwarm shadow-zwarm-dark">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center text-yellow-400">
            Launch a New Mission
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                Mission Title
              </label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Open Source AI Detector"
                className="bg-black-800 border-gray-700 text-white placeholder-gray-500 focus:ring-yellow-500 focus:border-yellow-500"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                Mission Description
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the goals, scope, and how others can contribute..."
                rows={6}
                className="bg-black-800 border-gray-700 text-white placeholder-gray-500 focus:ring-yellow-500 focus:border-yellow-500"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Mission Emoji</label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 border-gray-700 hover:bg-gray-800"
                  disabled={isLoading}
                >
                  <span className="text-3xl">{selectedEmoji}</span>
                </Button>
                {showEmojiPicker && (
                  <div className="absolute z-20 mt-2 bg-black-900 rounded-lg shadow-xl border border-gray-700">
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      theme={Theme.DARK}
                      lazyLoadEmojis={true}
                      width={320}
                    />
                  </div>
                )}
                <span className="text-gray-400 text-sm">Choose an emoji that represents your mission!</span>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black-950 font-bold py-3 text-lg transition-all hover:scale-105"
              disabled={isLoading}
            >
              {isLoading ? 'Launching Mission...' : 'Launch Mission'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}