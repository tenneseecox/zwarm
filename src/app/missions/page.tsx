// src/app/missions/page.tsx
import { Header } from '@/components/Header'; //
import { MissionCard, type Mission } from '@/components/MissionCard'; //
import { SwarmBackground } from '@/components/SwarmBackground'; //
import Link from 'next/link';
import { Button } from '@/components/ui/button'; //

// Define a type for the mission data fetched from your API
// This should align with what your /api/missions GET endpoint returns,
// including the owner details if you included them.
interface FetchedMission extends Mission { // Extends your existing Mission type
  owner?: { // Optional owner details from the include
    id: string;
    username: string | null;
    emoji: string | null;
  };
  participantsCount?: number;
  createdAt?: string;
  // Your MissionCard component expects contributors and timeAgo.
  // For now, we'll mock these or adapt the card.
  // Ideally, the API would provide these or they'd be calculated.
}


async function getMissions(): Promise<FetchedMission[]> {
  try {
    // Fetch from the API route we created.
    // Using an absolute URL is more robust for server-side fetching in Route Handlers/Server Components.
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${siteUrl}/api/missions`, {
      cache: 'no-store', // Or 'force-cache' or revalidate tags depending on desired freshness
    });

    if (!response.ok) {
      console.error("Failed to fetch missions:", response.status, await response.text());
      return [];
    }
    const missionsData = await response.json();

    // Adapt data for MissionCard if necessary (contributors, timeAgo)
    return missionsData.map((mission: FetchedMission) => ({
      ...mission,
      contributors: mission.participantsCount || 0, // Example: if your API returns this
      timeAgo: mission.createdAt ? new Date(mission.createdAt).toLocaleDateString() : 'N/A', // Basic example
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
            <Button className="bg-blue-500 hover:bg-blue-400 text-white font-semibold">
              🚀 Launch New Mission
            </Button>
          </Link>
        </div>

        {missions.length === 0 ? (
          <div className="text-center text-gray-400 py-10 glass-dark rounded-zwarm">
            <p className="text-xl mb-2">No missions found yet.</p>
            <p>Be the first to launch one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {missions.map((mission) => {
              // Adapt the mission data to what MissionCard expects
              // Your MissionCard expects: id, emoji, title, description, contributors, timeAgo
              // The FetchedMission type should align with this.
              const cardProps = {
                id: mission.id,
                emoji: mission.emoji || '❓',
                title: mission.title,
                description: mission.description,
                contributors: mission.contributors || 0, // Mock or use real data
                timeAgo: mission.timeAgo || 'some time ago', // Mock or use real data
              };
              return <MissionCard key={mission.id} {...cardProps} />;
            })}
          </div>
        )}
      </main>
    </div>
  );
}

// Note: Your `MissionCard` component currently takes `contributors: number` and `timeAgo: string`.
// You'll need to ensure your API provides this data or adapt the `MissionCard`
// or the data transformation in `getMissions`. For now, I've added placeholders.