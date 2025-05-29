// src/components/EditMissionForm.tsx
"use client";

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner'; // Or your toast library
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { TagInput } from '@/components/TagInput'; // Your existing TagInput
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { useState } from 'react';
import { getAbsoluteUrl } from '@/utils/site-url';
// Use the same Zod schema as your PUT API route, or a specific one for edits
// For example, import { updateMissionSchema } from '@/lib/validators/mission'; (if you defined it there)

// Assuming updateMissionSchema is defined (similar to createMissionSchema, possibly with status)
const updateMissionSchemaClient = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  emoji: z.string().min(1, { message: 'Please select an emoji.' }),
  tags: z.array(
            z.string()
             .min(1, { message: "Tag cannot be empty." })
             .max(25, { message: "Tag cannot be longer than 25 characters." })
             .regex(/^[a-zA-Z0-9-]+$/, { message: "Tag can only contain letters, numbers, and hyphens." })
          )
          .max(5, { message: "You can add a maximum of 5 tags." }),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED']).optional(),
});

type UpdateMissionFormData = z.infer<typeof updateMissionSchemaClient>;

// Assuming DetailedMission type is available (e.g., imported from detail page or a shared types file)
interface DetailedMissionForForm {
    id: string;
    title: string;
    description: string;
    emoji: string | null;
    status: string; // Or your enum
    tags?: string[];
    // Add other fields as needed
}

interface EditMissionFormProps {
  mission: DetailedMissionForForm;
}

export function EditMissionForm({ mission }: EditMissionFormProps) {
  const router = useRouter();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<UpdateMissionFormData>({
    resolver: zodResolver(updateMissionSchemaClient),
    defaultValues: {
      title: mission.title || '',
      description: mission.description || '',
      emoji: mission.emoji || '🎯',
      tags: mission.tags || [],
      status: mission.status as UpdateMissionFormData['status'] || 'OPEN', // Cast if necessary, ensure type matches
    },
  });

  const selectedEmoji = watch('emoji');

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setValue('emoji', emojiData.emoji, { shouldValidate: true, shouldDirty: true });
    setShowEmojiPicker(false);
  };

  const onSubmit = async (data: UpdateMissionFormData) => {
    try {
      const response = await fetch(getAbsoluteUrl(`/api/missions/${mission.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.details && Array.isArray(errorData.details)) {
            errorData.details.forEach((issue: { path: (string|number)[], message: string }) => {
                setError(issue.path.join('.') as keyof UpdateMissionFormData, { type: 'server', message: issue.message});
            });
        } else {
            toast.error(errorData.error || 'Failed to update mission.');
            setError("root.serverError", { message: errorData.error || "Unknown server error"});
        }
        return;
      }

      toast.success('Mission updated successfully!');
      router.push(`/missions/${mission.id}`); // Redirect to the mission detail page
      router.refresh(); // Ensure data is fresh on the detail page
    } catch (error) {
      console.error('Error updating mission:', error);
      toast.error('An unexpected error occurred.');
      setError("root.serverError", { message: "An unexpected client-side error occurred."});
    }
  };

  return (
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
              className="bg-black-800/50 border-yellow-500/20 focus:border-yellow-500/40 focus:ring-yellow-500/20 rounded-xl"
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
              rows={6}
              className="bg-black-800/50 border-yellow-500/20 focus:border-yellow-500/40 focus:ring-yellow-500/20 rounded-xl"
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

      {/* Status Field */}
      <div>
        <Label className="block text-sm font-medium text-gray-300 mb-2">Mission Status</Label>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <select
              {...field}
              className="w-full p-3 bg-black-800/50 border-yellow-500/20 focus:border-yellow-500/40 focus:ring-yellow-500/20 rounded-xl text-white"
            >
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          )}
        />
        {errors.status && <p className="text-sm text-red-400 mt-2">{errors.status.message}</p>}
      </div>

      {errors.root?.serverError && (
        <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-200">
          <p className="font-semibold">Error:</p>
          <p>{errors.root.serverError.message}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black-950 font-bold py-3 text-lg rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-zwarm-glow"
      >
        {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
      </Button>
    </form>
  );
}