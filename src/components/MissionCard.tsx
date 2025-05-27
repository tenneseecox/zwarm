// src/components/MissionCard.tsx (or your actual path)
"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge"; // Import the Badge component

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
      className="glass-dark rounded-[var(--zwarm-radius)] p-6 flex flex-col gap-4 transition-all hover:scale-105 hover:shadow-zwarm-yellow-glow focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:outline-none cursor-pointer border-2 border-transparent hover:border-[var(--zwarm-yellow)]"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick();
        }
      }}
    >
      <div className="text-3xl bg-[var(--zwarm-yellow)] rounded-full p-3 w-14 h-14 flex items-center justify-center shadow-[var(--zwarm-shadow-glow)] border-2 border-[#fffbe6] transition-transform group-hover:rotate-[-8deg] group-hover:scale-110">
        {emoji}
      </div>
      <h3 className="text-xl font-bold text-white line-clamp-2">{title}</h3>
      <p className="text-gray-300 leading-relaxed text-sm line-clamp-3 flex-grow">{summary}</p>

      {/* Display Tags */}
      {tags && tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.slice(0, 3).map((tag) => ( // Show up to 3 tags
            <Badge key={tag} variant="outline" className="text-xs border-yellow-500 text-yellow-400 px-2 py-0.5">
              {tag}
            </Badge>
          ))}
          {tags.length > 3 && (
             <Badge variant="outline" className="text-xs border-gray-600 text-gray-400 px-2 py-0.5">
               +{tags.length - 3} more
             </Badge>
          )}
        </div>
      )}

      <div className="flex gap-3 mt-auto pt-3 text-[var(--zwarm-blue)] font-bold text-sm border-t border-gray-700/50"> {/* Added border-t */}
        <span>🧑‍💻 {contributors}</span>
        <span>⏱️ {timeAgo}</span>
      </div>
    </div>
  );
}