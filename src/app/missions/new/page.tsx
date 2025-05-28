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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title Field */}
            <div>
              <Label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Mission Title</Label>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Input
                    id="title"
                    {...field}
                    placeholder="e.g., Open Source AI Detector"
                    className="bg-black-800 border-gray-700 text-white placeholder-gray-500 focus:ring-yellow-500 focus:border-yellow-500"
                    disabled={isSubmitting}
                  />
                )}
              />
              {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
            </div>

            {/* Description Field */}
            <div>
              <Label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Mission Description</Label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="description"
                    {...field}
                    placeholder="Describe the goals, scope, and how others can contribute..."
                    rows={6}
                    className="bg-black-800 border-gray-700 text-white placeholder-gray-500 focus:ring-yellow-500 focus:border-yellow-500"
                    disabled={isSubmitting}
                  />
                )}
              />
              {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>}
            </div>

            {/* Emoji Field */}
            <div>
              <Label className="block text-sm font-medium text-gray-300 mb-1">Mission Emoji</Label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 border-gray-700 hover:bg-gray-800"
                  disabled={isSubmitting}
                >
                  <span className="text-3xl">{selectedEmoji || '🎯'}</span>
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
                <span className="text-gray-400 text-sm">Choose an emoji!</span>
              </div>
              {errors.emoji && <p className="text-sm text-red-500 mt-1">{errors.emoji.message}</p>}
            </div>

            {/* Tags Field */}
            <div>
              <Label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-1">
                Tags (Max 5, e.g., &apos;activism&apos;, &apos;tech-for-good&apos;)
              </Label>
              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <TagInput
                    value={field.value || []}
                    onChange={field.onChange}
                    placeholder="Type a tag and press Enter..."
                    maxTags={5} // Corresponds to Zod schema
                    maxTagLength={25} // Corresponds to Zod schema
                    validateTag={(tag: string) => /^[a-zA-Z0-9-]+$/.test(tag) && tag.length > 0 && tag.length <= 25} // Example validation
                    // Ensure your TagInput component's internal validation aligns or relies on what RHF passes
                  />
                )}
              />
              {/* Displaying general tags error (e.g., "max 5 tags") */}
              {errors.tags && typeof errors.tags.message === 'string' && (
                  <p className="text-sm text-red-500 mt-1">{errors.tags.message}</p>
              )}
              {/* Displaying errors for individual tags if your Zod schema and API return them that way */}
              {Array.isArray(errors.tags) && errors.tags.map((tagError: { message: string }, index: number) => (
                  tagError && <p key={index} className="text-sm text-red-500 mt-1">Tag {index + 1}: {tagError.message}</p>
              ))}
            </div>
            
            {/* Root Server Error */}
            {errors.root?.serverError && <p className="text-sm text-red-500 mt-1">{errors.root.serverError.message}</p>}

            <Button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black-950 font-bold py-3 text-lg transition-all hover:scale-105"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Launching Mission...' : 'Launch Mission'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}