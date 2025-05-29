// src/app/profile/settings/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/utils/supabase/client';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { Header } from '@/components/Header';
import { SwarmBackground } from '@/components/SwarmBackground';
import type { User } from '@supabase/supabase-js';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

const settingsSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters.")
    .max(25, "Username can be at most 25 characters.")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores.")
    .optional(),
  emoji: z.string().optional(),
  bio: z.string()
    .max(500, "Bio must be at most 500 characters.")
    .optional(),
  skills: z.array(z.string())
    .max(10, "You can add up to 10 skills.")
    .optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      username: '',
      emoji: '😀',
      bio: '',
      skills: [],
    },
  });

  const selectedEmoji = watch('emoji');
  const skills = watch('skills') || [];

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        toast.error("You must be logged in to view settings.");
        router.push('/sign-in?next=/profile/settings');
        return;
      }
      setUser(session.user);

      const { data: profile, error: profileError } = await supabase
        .from('User')
        .select('username, emoji, bio, skills')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        toast.error("Could not fetch your profile data. Please try again.");
        console.error("Profile fetch error:", profileError);
      } else if (profile) {
        setValue('username', profile.username || '');
        setValue('emoji', profile.emoji || '😀');
        setValue('bio', profile.bio || '');
        setValue('skills', profile.skills || []);
      }
      setIsLoading(false);
    };
    fetchUserData();
  }, [supabase, router, setValue]);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setValue('emoji', emojiData.emoji, { shouldValidate: true, shouldDirty: true });
    setShowEmojiPicker(false);
  };

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    if (skills.length >= 10) {
      toast.error("You can add up to 10 skills.");
      return;
    }
    if (skills.includes(newSkill.trim())) {
      toast.error("This skill is already added.");
      return;
    }
    setValue('skills', [...skills, newSkill.trim()], { shouldValidate: true });
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setValue('skills', skills.filter(skill => skill !== skillToRemove), { shouldValidate: true });
  };

  const onSubmit = async (data: SettingsFormData) => {
    try {
      const response = await fetch('/api/users/me/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.details && Array.isArray(result.details)) {
          result.details.forEach((issue: { path: (string | number)[], message: string }) => {
            setError(issue.path.join('.') as keyof SettingsFormData, { type: 'server', message: issue.message });
          });
          toast.error("Please correct the errors in the form.");
        } else {
          toast.error(result.error || `Failed to update settings (HTTP ${response.status})`);
          setError("root.serverError", { message: result.error || "An unknown server error occurred."});
        }
      } else {
        toast.success("Settings updated successfully!");
        router.refresh();
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("An unexpected error occurred.");
      setError("root.serverError", { message: "An unexpected network or client-side error occurred."});
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black-950 flex flex-col items-center justify-center text-white">
        <SwarmBackground />
        <div className="glass-dark rounded-2xl p-8 border border-yellow-500/10">
          <p className="text-lg text-gray-300">Loading your settings...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black-950 text-white">
      <SwarmBackground />
      <Header />
      <main className="relative z-10 container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-2xl mx-auto">
          <div className="glass-dark rounded-2xl p-8 shadow-zwarm-dark border border-yellow-500/10 hover:border-yellow-500/20 transition-all duration-300">
            <div className="flex items-center gap-3 mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                Profile Settings
              </h1>
              <div className="h-px flex-1 bg-gradient-to-r from-yellow-500/50 to-transparent"></div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">Username</Label>
                  <Controller
                    name="username"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="username"
                        {...field}
                        placeholder="Your unique username"
                        className="bg-black-800/50 border-yellow-500/20 focus:border-yellow-500/40 focus:ring-yellow-500/20 rounded-xl"
                        disabled={isSubmitting}
                      />
                    )}
                  />
                  {errors.username && (
                    <p className="text-sm text-red-400 mt-2">{errors.username.message}</p>
                  )}
                </div>

                <div>
                  <Label className="block text-sm font-medium text-gray-300 mb-2">Profile Emoji</Label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-3 border-yellow-500/20 hover:bg-yellow-500/10 rounded-xl transition-all duration-300"
                      disabled={isSubmitting}
                    >
                      <span className="text-3xl">{selectedEmoji || '😀'}</span>
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
                  </div>
                  {errors.emoji && (
                    <p className="text-sm text-red-400 mt-2">{errors.emoji.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">Bio</Label>
                  <Controller
                    name="bio"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        id="bio"
                        {...field}
                        placeholder="Tell us about yourself..."
                        className="bg-black-800/50 border-yellow-500/20 focus:border-yellow-500/40 focus:ring-yellow-500/20 rounded-xl min-h-[120px]"
                        disabled={isSubmitting}
                      />
                    )}
                  />
                  {errors.bio && (
                    <p className="text-sm text-red-400 mt-2">{errors.bio.message}</p>
                  )}
                </div>

                <div>
                  <Label className="block text-sm font-medium text-gray-300 mb-2">Skills</Label>
                  <div className="flex gap-2 mb-3">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill..."
                      className="bg-black-800/50 border-yellow-500/20 focus:border-yellow-500/40 focus:ring-yellow-500/20 rounded-xl"
                      disabled={isSubmitting}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={handleAddSkill}
                      disabled={isSubmitting || !newSkill.trim()}
                      className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black-950 font-medium px-4 rounded-xl transition-all duration-300"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-all duration-300 rounded-full px-4 py-1.5 text-sm font-medium border border-yellow-500/20"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-1.5 hover:text-yellow-300 transition-colors duration-300"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  {errors.skills && (
                    <p className="text-sm text-red-400 mt-2">{errors.skills.message}</p>
                  )}
                </div>
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
                {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}