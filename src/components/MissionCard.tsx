"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

export interface Mission {
  id: string;
  emoji: string;
  title: string;
  description: string;
  contributors: number;
  timeAgo: string;
}

interface MissionCardProps extends Mission {
  onClick?: () => void;
}

export function MissionCard({ id, emoji, title, description, contributors, timeAgo, onClick }: MissionCardProps) {
  const router = useRouter();
  
  const handleClick = useCallback(() => {
    if (onClick) {
      onClick();
    } else {
      router.push(`/missions/${id}`);
    }
  }, [id, onClick, router]);

  return (
    <div 
      className="glass-dark rounded-[var(--zwarm-radius)] p-6 flex flex-col gap-4 transition-all hover:scale-105 hover:border-2 hover:border-[var(--zwarm-yellow)] cursor-pointer"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick();
        }
      }}
    >
      <div className="text-3xl bg-[var(--zwarm-yellow)] rounded-full p-3 w-14 h-14 flex items-center justify-center shadow-[var(--zwarm-shadow-glow)] border-2 border-[#fffbe6] transition-transform hover:rotate-[-8deg] hover:scale-110">
        {emoji}
      </div>
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="text-gray-300 leading-relaxed">{description}</p>
      <div className="flex gap-3 mt-auto text-[var(--zwarm-blue)] font-bold">
        <span>🧑‍💻 {contributors}</span>
        <span>⏱️ {timeAgo}</span>
      </div>
    </div>
  );
} 