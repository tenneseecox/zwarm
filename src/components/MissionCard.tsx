// src/components/MissionCard.tsx (or your actual path)
"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export interface Mission {
  id: string;
  emoji: string;
  title: string;
  description: string;
  contributors: number; // This might need to be fetched/calculated differently later
  timeAgo: string; // This might be calculated from createdAt
  tags?: string[]; // <-- ADD THIS LINE (optional, in case some missions don't have it)
  status?: string; // Optional: if you want to show status on card too
  // Consider if 'description' should be a shorter summary for the card
}

interface MissionCardProps extends Mission {
  onClick?: () => void;
}

export function MissionCard({
  id,
  emoji,
  title,
  description,
  contributors,
  timeAgo,
  tags, // <-- Destructure tags
  status,
  onClick,
}: MissionCardProps) {
  const router = useRouter();

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick();
    } else {
      router.push(`/missions/${id}`);
    }
  }, [id, onClick, router]);

  // Truncate description for card view if it's too long
  const summary = description.length > 100 ? description.substring(0, 97) + "..." : description;

  return (
    <div
      className="glass-dark rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 hover:scale-105 hover:shadow-zwarm-glow focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:outline-none cursor-pointer border border-yellow-500/10 hover:border-yellow-500/20"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick();
        }
      }}
    >
      <div className="flex items-start gap-4">
        <div className="text-3xl bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-3 w-14 h-14 flex items-center justify-center shadow-zwarm-glow border-2 border-yellow-100 transform hover:scale-105 transition-transform duration-300">
          {emoji}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent line-clamp-2">
            {title}
          </h3>
          {status && (
            <Badge
              variant="secondary"
              className={`mt-2 ${
                status === 'OPEN' ? 'bg-green-600/20 text-green-400' :
                status === 'COMPLETED' ? 'bg-blue-600/20 text-blue-400' :
                'bg-gray-600/20 text-gray-400'
              }`}
            >
              {status}
            </Badge>
          )}
        </div>
      </div>

      <p className="text-gray-300 leading-relaxed text-sm line-clamp-3 flex-grow">
        {summary}
      </p>

      {/* Display Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-all duration-300 rounded-full px-3 py-1 text-xs font-medium border border-yellow-500/20"
            >
              {tag}
            </Badge>
          ))}
          {tags.length > 3 && (
            <Badge
              variant="secondary"
              className="bg-gray-500/10 text-gray-400 rounded-full px-3 py-1 text-xs font-medium border border-gray-500/20"
            >
              +{tags.length - 3} more
            </Badge>
          )}
        </div>
      )}

      <div className="flex items-center gap-4 mt-auto pt-3 text-sm border-t border-yellow-500/10">
        <span className="flex items-center gap-1.5 text-yellow-400">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/50"></span>
          {contributors} contributors
        </span>
        <span className="flex items-center gap-1.5 text-gray-400">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-500/50"></span>
          {timeAgo}
        </span>
      </div>
    </div>
  );
}