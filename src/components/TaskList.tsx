// src/components/TaskList.tsx
"use client";

import type { MissionTaskData } from '@/app/missions/[id]/page'; // Import the type
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: MissionTaskData[];
  missionId: string;
  currentUserId: string | null | undefined;
  missionOwnerId: string | null | undefined;
}

export function TaskList({ tasks, missionId, currentUserId, missionOwnerId }: TaskListProps) {
  if (!tasks || tasks.length === 0) {
    return <p className="text-gray-400 italic">No tasks defined for this mission yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          missionId={missionId}
          currentUserId={currentUserId}
          missionOwnerId={missionOwnerId}
        />
      ))}
    </ul>
  );
}