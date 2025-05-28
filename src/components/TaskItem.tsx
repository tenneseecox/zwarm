// src/components/TaskItem.tsx
"use client";

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox'; // Assuming you have: npx shadcn-ui@latest add checkbox
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react'; // Icons
import type { MissionTaskData } from '@/app/missions/[missionId]/page'; // Fixed import path

interface TaskItemProps {
  task: MissionTaskData;
  missionId: string;
  currentUserId: string | null | undefined; // ID of the currently logged-in user
  missionOwnerId: string | null | undefined;
  // onUpdate: (updatedTask: MissionTaskData) => void; // Callbacks to update parent state if not using router.refresh fully
  // onDelete: (taskId: string) => void;
}

export function TaskItem({ task, missionId, currentUserId, missionOwnerId }: TaskItemProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const canModify = currentUserId && (currentUserId === missionOwnerId || currentUserId === task.creator.id);
  // More granular: canToggle might be true for any participant, canDelete for owner/creator
  const canToggleComplete = currentUserId && (currentUserId === missionOwnerId || currentUserId === task.creator.id /* || userIsParticipant */);


  const handleToggleComplete = async () => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/missions/${missionId}/tasks/${task.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isCompleted: !task.isCompleted }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          toast.error(errorData.error || 'Failed to update task status.');
          return;
        }
        toast.success(`Task marked as ${!task.isCompleted ? 'complete' : 'incomplete'}.`);
        router.refresh();
      } catch (error: unknown) {
        console.error('Error updating task status:', error);
        toast.error('Error updating task status.');
      }
    });
  };

  const handleDelete = async () => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/missions/${missionId}/tasks/${task.id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json();
          toast.error(errorData.error || 'Failed to delete task.');
          return;
        }
        toast.success('Task deleted.');
        router.refresh();
      } catch (error: unknown) {
        console.error('Error deleting task:', error);
        toast.error('Error deleting task.');
      }
    });
  };

  return (
    <li className={`flex items-center justify-between gap-3 p-3 rounded-lg border transition-colors duration-150 ${task.isCompleted ? 'bg-green-900/30 border-green-700/50' : 'bg-black-800/50 border-gray-700/60'}`}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {canToggleComplete ? (
            <Checkbox
            id={`task-${task.id}`}
            checked={task.isCompleted}
            onCheckedChange={handleToggleComplete}
            disabled={isPending}
            className="border-gray-500 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-600"
            />
        ) : (
            <Checkbox
            id={`task-${task.id}`}
            checked={task.isCompleted}
            disabled // Visually show status but non-interactive if no permission
            className="border-gray-500 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-600"
            />
        )}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xl">{task.emoji || '📝'}</span>
          <label
            htmlFor={`task-${task.id}`}
            className={`flex-1 text-sm break-words ${task.isCompleted ? 'line-through text-gray-500' : 'text-gray-100'}`}
          >
            {task.text}
          </label>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {canModify && (
          <>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-400" disabled={isPending} onClick={handleDelete}>
              <Trash2 size={16} />
            </Button>
          </>
        )}
      </div>
    </li>
  );
}