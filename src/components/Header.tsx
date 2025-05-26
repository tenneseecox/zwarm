"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="glass-dark rounded-b-[var(--zwarm-radius)] p-8 relative z-20">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-[var(--zwarm-yellow)] rounded-full flex items-center justify-center text-3xl shadow-[var(--zwarm-shadow-glow)] border-3 border-[#fffbe6] transition-transform group-hover:rotate-[-10deg] group-hover:scale-110">
            🐝
          </div>
          <span className="text-3xl font-black tracking-tight text-white">zwarm</span>
        </Link>

        <nav className="flex items-center gap-8">
          <Link 
            href="/" 
            className={`text-lg font-bold transition-colors ${
              pathname === "/" 
                ? "text-[var(--zwarm-blue)] border-b-2 border-[var(--zwarm-blue)]" 
                : "text-white hover:text-[var(--zwarm-yellow)]"
            }`}
          >
            Home
          </Link>
          <Link 
            href="/missions" 
            className={`text-lg font-bold transition-colors ${
              pathname === "/missions" 
                ? "text-[var(--zwarm-blue)] border-b-2 border-[var(--zwarm-blue)]" 
                : "text-white hover:text-[var(--zwarm-yellow)]"
            }`}
          >
            Missions
          </Link>
          <Button 
            variant="ghost" 
            className="text-lg font-bold text-white/50 cursor-not-allowed"
            disabled
          >
            Start a Mission
          </Button>
          <Button 
            variant="ghost" 
            className="text-lg font-bold text-white/50 cursor-not-allowed"
            disabled
          >
            Sign In
          </Button>
        </nav>
      </div>
    </header>
  );
} 