// src/components/AddCommentForm.tsx
"use client";

import { useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button'; //
import { Textarea } from '@/components/ui/textarea'; //
import { Label } from '@/components/ui/label'; //
import { toast } from 'sonner'; //
import { useRouter } from 'next/navigation'; //
import { getAbsoluteUrl } from '@/utils/site-url';

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty.").max(1000, "Comment is too long."),
});
type CommentFormData = z.infer<typeof commentSchema>;

interface AddCommentFormProps {
  missionId: string;
  currentUserId: string | null | undefined;
  // onCommentAdded?: () => void; // Callback to refresh comment list
}

export function AddCommentForm({ missionId, currentUserId }: AddCommentFormProps) {
  const router = useRouter(); //
  const [isPending, startTransition] = useTransition(); //
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema), //
    defaultValues: { content: "" }, //
  });

  const onSubmit = async (data: CommentFormData) => {
    if (!currentUserId) {
        toast.error("You must be logged in to comment.");
        return;
    }
    startTransition(async () => {
      try {
        const response = await fetch(getAbsoluteUrl(`/api/missions/${missionId}`), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          toast.error(errorData.error || 'Failed to post comment.');
          return;
        }

        toast.success('Comment posted!');
        reset();
        router.refresh();
      } catch (error) {
        toast.error('An unexpected error occurred.');
        console.error("Error posting comment:", error);
      }
    });
  };

  if (!currentUserId) {
    return <p className="text-sm text-gray-400">Please <a href="/sign-in" className="underline text-yellow-400">sign in</a> to comment.</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 my-6 p-4 border border-gray-700 rounded-lg bg-black-800/30">
      <div>
        <Label htmlFor="commentContent" className="text-gray-300 font-semibold">Add a comment</Label>
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <Textarea
              id="commentContent"
              {...field}
              placeholder="Share your thoughts, updates, or questions..."
              rows={3}
              className="mt-1 bg-black-900 border-gray-600 text-white placeholder-gray-500 focus:ring-yellow-500 focus:border-yellow-500"
              disabled={isSubmitting || isPending}
            />
          )}
        />
        {errors.content && <p className="text-sm text-red-500 mt-1">{errors.content.message}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting || isPending} className="bg-yellow-500 hover:bg-yellow-600 text-black-950">
        {isPending || isSubmitting ? 'Posting...' : 'Post Comment'}
      </Button>
    </form>
  );
}