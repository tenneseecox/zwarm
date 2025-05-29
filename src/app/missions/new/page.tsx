// src/app/missions/new/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label'; // Shadcn UI Label
import { TagInput } from '@/components/TagInput'; // Your TagInput component
import { createClient } from '@/utils/supabase/client'; // Adjust path as needed
import { getAbsoluteUrl } from '@/utils/site-url';

import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { Header } from '@/components/Header';
import { SwarmBackground } from '@/components/SwarmBackground';

// Define your Zod schema (or import it from src/lib/validators/mission.ts)
// This should match the schema used in your API route
const createMissionSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  emoji: z.string().min(1, { message: 'Please select an emoji.' }), // Making emoji required
  tags: z.array(
    z.string()
      .min(1, { message: "Tag cannot be empty." })
      .max(25, { message: "Tag cannot be longer than 25 characters." })
      .regex(/^[a-zA-Z0-9-]+$/, { message: "Tag can only contain letters, numbers, and hyphens." })
  )
  .max(5, { message: "You can add a maximum of 5 tags." }),
});

type CreateMissionFormData = z.infer<typeof createMissionSchema>;

export default function CreateMissionPage() {
  const router = useRouter();
  const supabase = createClient();

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true); // For initial auth check

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createMissionSchema),
    defaultValues: {
      title: '',
      description: '',
      emoji: '🎯',
      tags: [],
    },
  });

  const selectedEmoji = watch('emoji'); // Watch the emoji field for display

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in to create a mission.");
        router.push('/sign-in');
      } else {
        setIsAuthLoading(false); // Auth check complete, user is authenticated
      }
    };
    checkAuth();
  }, [supabase, router]);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setValue('emoji', emojiData.emoji, { shouldValidate: true, shouldDirty: true });
    setShowEmojiPicker(false);
  };

  const onSubmit = async (data: CreateMissionFormData) => {
    try {
      const response = await fetch(getAbsoluteUrl('/api/missions'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.issues && Array.isArray(result.issues)) {
          result.issues.forEach((issue: { path: (string | number)[], message: string }) => {
            const fieldName = issue.path.join('.') as keyof CreateMissionFormData;
            setError(fieldName, { type: 'server', message: issue.message });
          });
           toast.error("Please correct the errors in the form.");
        } else {
          toast.error(result.error || `Failed to create mission (HTTP ${response.status})`);
          setError("root.serverError", { message: result.error || "An unknown server error occurred."});
        }
      } else {
        toast.success("Mission created successfully!");
        router.push(`/missions/${result.id}`);
      }
    } catch (error) {
      console.error("Error submitting mission:", error);
      toast.error("An unexpected error occurred while creating the mission.");
      setError("root.serverError", { message: "An unexpected network or client-side error occurred."});
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-black-950 flex flex-col items-center justify-center text-white">
        <SwarmBackground />
        <div className="glass-dark rounded-2xl p-8 border border-yellow-500/10">
          <p className="text-lg text-gray-300">Loading and checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black-950 text-white">
      <SwarmBackground />
      <Header />
      <main className="relative z-10 container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-2xl mx-auto">
          <div className="glass-dark rounded-2xl p-8 shadow-zwarm-dark border border-yellow-500/10 hover:border-yellow-500/20 transition-all duration-300">
            <div className="flex items-center gap-3 mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                Launch a New Mission
              </h1>
              <div className="h-px flex-1 bg-gradient-to-r from-yellow-500/50 to-transparent"></div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Title Field */}
              <div>
                <Label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">Mission Title</Label>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="title"
                      {...field}
                      placeholder="e.g., Open Source AI Detector"
                      className="bg-black-800/50 border-yellow-500/20 focus:border-yellow-500/40 focus:ring-yellow-500/20 rounded-xl"
                      disabled={isSubmitting}
                    />
                  )}
                />
                {errors.title && <p className="text-sm text-red-400 mt-2">{errors.title.message}</p>}
              </div>

              {/* Description Field */}
              <div>
                <Label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">Mission Description</Label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      id="description"
                      {...field}
                      placeholder="Describe the goals, scope, and how others can contribute..."
                      rows={6}
                      className="bg-black-800/50 border-yellow-500/20 focus:border-yellow-500/40 focus:ring-yellow-500/20 rounded-xl"
                      disabled={isSubmitting}
                    />
                  )}
                />
                {errors.description && <p className="text-sm text-red-400 mt-2">{errors.description.message}</p>}
              </div>

              {/* Emoji Field */}
              <div>
                <Label className="block text-sm font-medium text-gray-300 mb-2">Mission Emoji</Label>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-3 border-yellow-500/20 hover:bg-yellow-500/10 rounded-xl transition-all duration-300"
                    disabled={isSubmitting}
                  >
                    <span className="text-3xl">{selectedEmoji || '🎯'}</span>
                  </Button>
                  {showEmojiPicker && (
                    <div className="absolute z-20 mt-2 bg-black-900 rounded-xl shadow-xl border border-yellow-500/20">
                      <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        theme={Theme.DARK}
                        lazyLoadEmojis={true}
                        width={320}
                      />
                    </div>
                  )}
                  <span className="text-gray-400 text-sm">Choose an emoji!</span>
                </div>
                {errors.emoji && <p className="text-sm text-red-400 mt-2">{errors.emoji.message}</p>}
              </div>

              {/* Tags Field */}
              <div>
                <Label className="block text-sm font-medium text-gray-300 mb-2">Tags</Label>
                <Controller
                  name="tags"
                  control={control}
                  render={({ field }) => (
                    <TagInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Type a tag and press Enter..."
                      className="bg-black-800/50 border-yellow-500/20 focus:border-yellow-500/40 focus:ring-yellow-500/20 rounded-xl"
                    />
                  )}
                />
                {errors.tags && <p className="text-sm text-red-400 mt-2">{errors.tags.message}</p>}
              </div>

              {errors.root?.serverError && (
                <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-200">
                  <p className="font-semibold">Error:</p>
                  <p>{errors.root.serverError.message}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black-950 font-bold py-3 text-lg rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-zwarm-glow"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Launching Mission...' : 'Launch Mission'}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}