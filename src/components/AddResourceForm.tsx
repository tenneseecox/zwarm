// src/components/AddResourceForm.tsx
"use client";

import { useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

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

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResourceFormData>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      url: '',
      description: '',
    },
  });

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="glass-dark rounded-2xl p-6 shadow-zwarm-dark border border-yellow-500/10 hover:border-yellow-500/20 transition-all duration-300">
        <div className="space-y-4">
          <div>
            <Label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-2">Resource URL</Label>
            <Controller
              name="url"
              control={control}
              render={({ field }) => (
                <Input
                  id="url"
                  {...field}
                  placeholder="https://example.com"
                  className="bg-black-800/50 border-yellow-500/20 focus:border-yellow-500/40 focus:ring-yellow-500/20 rounded-xl"
                  disabled={isSubmitting || isPending}
                />
              )}
            />
            {errors.url && <p className="text-sm text-red-400 mt-2">{errors.url.message}</p>}
          </div>

          <div>
            <Label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">Description (Optional)</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="description"
                  {...field}
                  placeholder="Describe the resource..."
                  className="bg-black-800/50 border-yellow-500/20 focus:border-yellow-500/40 focus:ring-yellow-500/20 rounded-xl"
                  disabled={isSubmitting || isPending}
                />
              )}
            />
            {errors.description && <p className="text-sm text-red-400 mt-2">{errors.description.message}</p>}
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || isPending}
        className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black-950 font-bold py-3 text-lg rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-zwarm-glow"
      >
        {isPending || isSubmitting ? 'Adding Resource...' : 'Add Resource'}
      </Button>
    </form>
  );
}