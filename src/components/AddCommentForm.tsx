// src/components/AddCommentForm.tsx
"use client";

import { useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: "" },
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                placeholder="Write a comment..."
                className="bg-black-800/50 border-yellow-500/20 focus:border-yellow-500/40 focus:ring-yellow-500/20 rounded-xl min-h-[100px]"
                disabled={isSubmitting || isPending}
              />
            )}
          />
          {errors.content && <p className="text-sm text-red-400 mt-2">{errors.content.message}</p>}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || isPending}
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black-950 font-bold py-3 px-4 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-zwarm-glow"
        >
          {isPending || isSubmitting ? 'Posting...' : 'Post Comment'}
        </Button>
      </div>
    </form>
  );
}