// src/components/ResourceList.tsx
"use client";

import { ResourceItem } from './ResourceItem';

interface MissionResourceData { // Using the type defined earlier
  id: string;
  title: string;
  url: string;
  description: string | null;
  createdAt: string;
  user: {
    id: string;
    username: string | null;
    emoji: string | null;
  };
}

interface ResourceListProps {
  resources: MissionResourceData[];
  missionId: string;
  isOwner: boolean;
}

export function ResourceList({ resources, missionId, isOwner }: ResourceListProps) {
  if (!resources || resources.length === 0) {
    return <p className="text-gray-400 italic text-center py-4">No resources added for this mission yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {resources.map((resource) => (
        <ResourceItem
          key={resource.id}
          resource={resource}
          missionId={missionId}
          isOwner={isOwner}
        />
      ))}
    </ul>
  );
}