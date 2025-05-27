// src/components/DeleteMissionButton.tsx
"use client";

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; // Make sure you've added this: npx shadcn-ui@latest add alert-dialog
import { toast } from 'sonner'; // Or your toast library
import { Trash2 } from 'lucide-react'; // Optional icon

interface DeleteMissionButtonProps {
  missionId: string;
  missionTitle: string;
}

export function DeleteMissionButton({ missionId, missionTitle }: DeleteMissionButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDelete = async () => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/missions/${missionId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          toast.error(errorData.error || 'Failed to delete mission.');
          setIsDialogOpen(false); // Close dialog on error
          return;
        }

        toast.success(`Mission "${missionTitle}" deleted successfully!`);
        setIsDialogOpen(false); // Close dialog on success
        // Redirect to a relevant page, e.g., dashboard or missions list
        router.push('/dashboard'); // Or '/missions'
        router.refresh(); // Refresh current layout if user stays on a page that might get affected
      } catch (error) {
        console.error('Error deleting mission:', error);
        toast.error('An unexpected error occurred while deleting the mission.');
        setIsDialogOpen(false);
      }
    });
  };

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full sm:w-auto">
          <Trash2 className="mr-2 h-4 w-4" /> Delete Mission
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-black-900 border-gray-700 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-yellow-400">Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            This action cannot be undone. This will permanently delete the mission
            <span className="font-semibold text-yellow-500"> &ldquo;{missionTitle}&rdquo; </span>
            and all of its associated data (like participations).
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600 border-gray-600 text-white">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isPending ? 'Deleting...' : 'Yes, delete mission'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}