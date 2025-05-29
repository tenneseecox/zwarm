// src/components/AddTaskForm.tsx
"use client";

import { useTransition, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea'; // Using Textarea for potentially longer task text
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { Input } from '@/components/ui/input';

const taskSchema = z.object({
  text: z.string().min(1, "Task description cannot be empty.").max(500, "Task is too long."),
  emoji: z.string().optional(),
});
type TaskFormData = z.infer<typeof taskSchema>;

interface AddTaskFormProps {
  missionId: string;
}

export function AddTaskForm({ missionId }: AddTaskFormProps) {
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
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: { 
      text: "",
      emoji: "📝" // Default emoji for new tasks
    },
  });

  const selectedEmoji = watch('emoji');

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setValue('emoji', emojiData.emoji, { shouldValidate: true, shouldDirty: true });
    setShowEmojiPicker(false);
  };

  const onSubmit = async (data: TaskFormData) => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/missions/${missionId}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          toast.error(errorData.error || 'Failed to add task.');
          return;
        }

        toast.success('Task added successfully!');
        reset(); // Clear the form
        router.refresh(); // Refresh the page to show the new task
      } catch (error) {
        toast.error('An unexpected error occurred while adding the task.');
        console.error("Error adding task:", error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <Controller
            name="text"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Add a new task..."
                className="bg-black-800/50 border-yellow-500/20 focus:border-yellow-500/40 focus:ring-yellow-500/20 rounded-xl"
                disabled={isSubmitting || isPending}
              />
            )}
          />
          {errors.text && <p className="text-sm text-red-400 mt-2">{errors.text.message}</p>}
        </div>

        <div className="relative">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-3 border-yellow-500/20 hover:bg-yellow-500/10 rounded-xl transition-all duration-300"
            disabled={isSubmitting || isPending}
          >
            <span className="text-2xl">{selectedEmoji || '📝'}</span>
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

        <Button
          type="submit"
          disabled={isSubmitting || isPending}
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black-950 font-bold py-3 px-4 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-zwarm-glow"
        >
          {isPending || isSubmitting ? 'Adding...' : 'Add Task'}
        </Button>
      </div>
    </form>
  );
}