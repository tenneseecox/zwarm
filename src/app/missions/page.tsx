// src/app/missions/page.tsx
import { Header } from '@/components/Header';
import { MissionCard, type Mission as MissionCardType } from '@/components/MissionCard'; // Renamed imported Mission to avoid conflict
import { SwarmBackground } from '@/components/SwarmBackground';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    // IMPORTANT: Ensure your /api/missions endpoint returns 'tags', 'createdAt',
    // and data for 'contributors' (e.g., participantsCount or _count.participants)
    const response = await fetch(`${siteUrl}/api/missions`, {
      cache: 'no-store',
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
    console.error("Error in getMissions:", error);
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
          <h1 className="text-3xl md:text-4xl font-bold text-yellow-400">
            Explore Active Missions
          </h1>
          <Link href="/missions/new">
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-black-950 font-bold py-2 px-4 rounded-lg transition-colors duration-150 flex items-center gap-2 text-sm sm:text-base">
              🚀
              <span className="hidden sm:inline">Launch New Mission</span>
              <span className="sm:hidden">New Mission</span>
            </Button>
          </Link>
        </div>

        {missions.length === 0 ? (
          <div className="text-center text-gray-400 py-10 glass-dark rounded-zwarm">
            <p className="text-xl mb-2">No active missions found.</p>
            <p>Why not be the first to <Link href="/missions/new" className="text-yellow-400 hover:text-yellow-300 underline">launch one</Link>?</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {missions.map((mission) => (
              // The mission object from getMissions() now directly matches MissionCardType
              <MissionCard key={mission.id} {...mission} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}