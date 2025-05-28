// src/components/ResourceItem.tsx
"use client";

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

interface MissionResourceData { // Using the type defined earlier
  id: string;
  title: string;
  url: string;
  description: string | null;
  emoji: string | null;
  createdAt: string;
  user: {
    id: string;
    username: string | null;
    emoji: string | null;
  };
  // missionId: string; // if needed for delete
}

interface ResourceItemProps {
  resource: MissionResourceData;
  missionId: string; // Needed for the delete API call
  isOwner: boolean;
  // onDelete?: (resourceId: string) => void; // Callback for optimistic updates or direct handling
}

export function ResourceItem({ resource, missionId, isOwner }: ResourceItemProps) {
  const router = useRouter(); //
  const [isPending, startTransition] = useTransition(); //

  const handleDelete = async () => {
    startTransition(async () => { //
      try {
        const response = await fetch(`/api/missions/${missionId}/resources/${resource.id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json();
          toast.error(errorData.error || 'Failed to delete resource.'); //
          return;
        }
        toast.success('Resource deleted.'); //
        router.refresh(); //
      } catch (error) {
        toast.error('Error deleting resource.'); //
        console.error("Error deleting resource:", error)
      }
    });
  };


  return (
    <li className="py-3 px-4 bg-black-800/40 border border-gray-700/60 rounded-lg shadow-sm flex items-center justify-between gap-3">
      <div className="flex items-start space-x-3 min-w-0">
        <span className="text-2xl mt-1 flex-shrink-0">{resource.emoji || '🔗'}</span>
        <div className="min-w-0">
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base font-medium text-blue-400 hover:text-blue-300 hover:underline break-words"
          >
            {resource.title}
          </a>
          {resource.description && (
            <p className="mt-1 text-sm text-gray-400 break-words">
              {resource.description}
            </p>
          )}
        </div>
      </div>
      {isOwner && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          disabled={isPending}
          className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10 flex-shrink-0"
        >
          <Trash2 size={16} />
        </Button>
      )}
    </li>
  );
}