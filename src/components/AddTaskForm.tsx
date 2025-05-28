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
        <div className="flex-1">
          <Label htmlFor="taskText" className="text-gray-300 font-semibold">Add New Task</Label>
          <Controller
            name="text"
            control={control}
            render={({ field }) => (
              <Textarea
                id="taskText"
                {...field}
                placeholder="Describe the task..."
                rows={3}
                className="mt-1 bg-black-900 border-gray-600 text-white placeholder-gray-500 focus:ring-yellow-500 focus:border-yellow-500"
                disabled={isSubmitting || isPending}
              />
            )}
          />
          {errors.text && <p className="text-sm text-red-500 mt-1">{errors.text.message}</p>}
        </div>
      </div>
      <Button type="submit" disabled={isSubmitting || isPending} className="bg-yellow-500 hover:bg-yellow-600 text-black-950">
        {isPending || isSubmitting ? 'Adding Task...' : 'Add Task'}
      </Button>
    </form>
  );
}