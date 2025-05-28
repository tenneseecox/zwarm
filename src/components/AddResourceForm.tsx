// src/components/AddResourceForm.tsx
"use client";

import { useTransition, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';

const resourceSchema = z.object({
  title: z.string().min(1, "Title cannot be empty.").max(100),
  url: z.string().url("Must be a valid URL (e.g., http://example.com).").max(500),
  description: z.string().max(500).optional(),
  emoji: z.string().optional(),
});

type ResourceFormData = z.infer<typeof resourceSchema>;

interface AddResourceFormProps {
  missionId: string;
}

export default function AddResourceForm({ missionId }: AddResourceFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResourceFormData>({
    resolver: zodResolver(resourceSchema),
    defaultValues: { 
      title: "", 
      url: "", 
      description: "",
      emoji: "🔗" // Default emoji for new resources
    },
  });

  const selectedEmoji = watch('emoji');

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setValue('emoji', emojiData.emoji, { shouldValidate: true, shouldDirty: true });
    setShowEmojiPicker(false);
  };

  const onSubmit = async (data: ResourceFormData) => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/missions/${missionId}/resources`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          toast.error(errorData.error || 'Failed to add resource.');
          return;
        }
        toast.success('Resource added successfully!');
        reset();
        router.refresh();
      } catch (error) {
        toast.error('An unexpected error occurred.');
        console.error("Error adding resource:", error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6 p-4 border border-gray-700 rounded-lg bg-black-800/30">
      <div className="flex items-start gap-4">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-2xl p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            {selectedEmoji}
          </button>
          {showEmojiPicker && (
            <div className="absolute z-10 mt-2">
              <EmojiPicker 
                onEmojiClick={handleEmojiClick}
                theme={Theme.DARK}
                width={350}
                height={400}
              />
            </div>
          )}
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <Label htmlFor="title" className="text-gray-300 font-semibold">Resource Title</Label>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <Input
                  id="title"
                  {...field}
                  placeholder="Enter resource title..."
                  className="mt-1 bg-black-900 border-gray-600 text-white placeholder-gray-500 focus:ring-yellow-500 focus:border-yellow-500"
                  disabled={isSubmitting || isPending}
                />
              )}
            />
            {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <Label htmlFor="url" className="text-gray-300 font-semibold">Resource URL</Label>
            <Controller
              name="url"
              control={control}
              render={({ field }) => (
                <Input
                  id="url"
                  {...field}
                  placeholder="https://example.com"
                  className="mt-1 bg-black-900 border-gray-600 text-white placeholder-gray-500 focus:ring-yellow-500 focus:border-yellow-500"
                  disabled={isSubmitting || isPending}
                />
              )}
            />
            {errors.url && <p className="text-sm text-red-500 mt-1">{errors.url.message}</p>}
          </div>

          <div>
            <Label htmlFor="description" className="text-gray-300 font-semibold">Description (Optional)</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="description"
                  {...field}
                  placeholder="Describe the resource..."
                  className="mt-1 bg-black-900 border-gray-600 text-white placeholder-gray-500 focus:ring-yellow-500 focus:border-yellow-500"
                  disabled={isSubmitting || isPending}
                />
              )}
            />
            {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>}
          </div>
        </div>
      </div>
      <Button type="submit" disabled={isSubmitting || isPending} className="bg-yellow-500 hover:bg-yellow-600 text-black-950">
        {isPending || isSubmitting ? 'Adding Resource...' : 'Add Resource'}
      </Button>
    </form>
  );
}