// src/app/missions/page.tsx
import { Header } from '@/components/Header';
import { MissionCard, type Mission as MissionCardType } from '@/components/MissionCard'; // Renamed imported Mission to avoid conflict
import { SwarmBackground } from '@/components/SwarmBackground';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getAbsoluteUrl } from '@/utils/site-url';

// Define a type for the mission data fetched from your API
// This should align with what your /api/missions GET endpoint returns.
interface FetchedMission {
  id: string;
  emoji: string | null; // API might return null for emoji
  title: string;
  description: string;
  tags?: string[]; // <-- Ensure this is included from your API
  owner?: {
    id: string;
    username: string | null;
    emoji: string | null;
  };
  // Example fields that might come from API to derive card props
  _count?: { // If using Prisma's _count for participants
    participants: number;
  };
  participantsCount?: number; // Or a direct count
  createdAt: string; // Expecting ISO string
  status: string; // Assuming status is also fetched
  currentUserIsParticipant?: boolean;
}


// Helper function to format time (you can make this more sophisticated)
function formatTimeAgo(dateString: string | null): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString(); // Fallback to full date
}


async function getMissions(): Promise<MissionCardType[]> { // Return type matches what MissionCard expects
  try {
    const response = await fetch(getAbsoluteUrl('/api/missions'), {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) {
      console.error("Failed to fetch missions:", response.status, await response.text());
      return [];
    }
    const missionsData: FetchedMission[] = await response.json();

    // Adapt data for MissionCard
    return missionsData.map((mission) => ({
      id: mission.id,
      emoji: mission.emoji || '❓', // Default emoji if null
      title: mission.title,
      description: mission.description,
      tags: mission.tags || [], // Pass tags, default to empty array if undefined
      contributors: mission.participantsCount ?? mission._count?.participants ?? 0,
      timeAgo: formatTimeAgo(mission.createdAt),
      status: mission.status, // Pass status if MissionCard uses it
    }));

  } catch (error) {
    console.error("Error fetching missions:", error);
    return [];
  }
}

export default async function MissionsPage() {
  const missions = await getMissions();

  return (
    <div className="min-h-screen bg-black-950 text-white">
      <SwarmBackground />
      <Header />
      <main className="relative z-10 container mx-auto px-4 py-12 md:py-16">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <span className="text-3xl animate-bounce">🎯</span>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
              Explore Active Missions
            </h1>
          </div>
          <Link href="/missions/new">
            <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black-950 font-bold py-2 px-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-zwarm-glow hover:shadow-zwarm-glow-lg flex items-center gap-2 text-sm sm:text-base group">
              <span className="transform group-hover:rotate-12 transition-transform duration-300">🚀</span>
              <span className="hidden sm:inline">Launch New Mission</span>
              <span className="sm:hidden">New Mission</span>
            </Button>
          </Link>
        </div>

        {missions.length === 0 ? (
          <div className="text-center text-gray-400 py-10 glass-dark rounded-zwarm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-yellow-500/5 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-yellow-500/5 rounded-full blur-3xl"></div>
            </div>
            <p className="text-xl mb-2 relative z-10">No active missions found.</p>
            <p className="relative z-10">Why not be the first to <Link href="/missions/new" className="text-yellow-400 hover:text-yellow-300 underline transition-colors duration-300">launch one</Link>?</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {missions.map((mission) => (
              <MissionCard key={mission.id} {...mission} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}