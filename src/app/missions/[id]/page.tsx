// src/app/missions/[id]/page.tsx
import { Header } from '@/components/Header';
import { SwarmBackground } from '@/components/SwarmBackground';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

interface MissionDetailPageProps {
  params: {
    id: string;
  };
}

interface DetailedMission {
  id: string;
  title: string;
  description: string;
  emoji: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: string;
    username: string | null;
    emoji: string | null;
  };
  tags?: string[]; // <-- ADD THIS LINE (make it optional in case older missions don't have it)
}

async function getMissionDetails(id: string): Promise<DetailedMission | null> {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    // Ensure this API endpoint returns the 'tags' array
    const response = await fetch(`${siteUrl}/api/missions/${id}`, {
      cache: 'no-store',
    });

    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      console.error("Failed to fetch mission details:", response.status, await response.text());
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`Error in getMissionDetails for ID ${id}:`, error);
    return null;
  }
}

export default async function MissionDetailPage({ params }: MissionDetailPageProps) {
  // The 'await params' was from a previous specific error fix,
  // if that error is no longer present or was specific to an older Next.js version/setup,
  // direct destructuring might be fine. However, if 'await params' worked, keep it.
  // For this example, I'm sticking to the provided structure.
  const { id } = await params; // Assuming this is still the intended way you're getting id
  const mission = await getMissionDetails(id);

  if (!mission) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black-950 text-white">
      <SwarmBackground />
      <Header />
      <main className="relative z-10 container mx-auto px-4 py-12 md:py-16">
        <article className="max-w-3xl mx-auto glass-dark p-6 md:p-8 rounded-zwarm shadow-zwarm-dark">
          <div className="flex items-start gap-4 mb-6">
            {mission.emoji && (
              <div className="text-5xl md:text-6xl bg-yellow-500 rounded-full p-3 w-20 h-20 md:w-24 md:h-24 flex items-center justify-center shadow-zwarm-glow border-2 border-yellow-100">
                {mission.emoji}
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2 break-words">
                {mission.title}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                <span>Owned by: {mission.owner?.username || 'Unknown User'} {mission.owner?.emoji}</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-400 mb-3"> {/* Added mb-3 here */}
                <span>Status: </span>
                <Badge
                  variant={mission.status === 'OPEN' ? 'default' : mission.status === 'COMPLETED' ? 'secondary' : 'outline'}
                  className={
                    mission.status === 'OPEN' ? 'bg-green-600 text-white' :
                    mission.status === 'COMPLETED' ? 'bg-blue-600 text-white' :
                    'border-gray-600 text-gray-300'
                  }
                >
                  {mission.status}
                </Badge>
                <span>| Created: {new Date(mission.createdAt).toLocaleDateString()}</span>
              </div>

              {/* Display Tags */}
              {mission.tags && mission.tags.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-300 mb-1">Tags:</h3>
                  <div className="flex flex-wrap gap-2">
                    {mission.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="border-yellow-500 text-yellow-400">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed">
            <p>{mission.description}</p>
          </div>

          <div className="mt-10 border-t border-gray-700 pt-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Mission Control</h2>
            <p className="text-gray-400">Tasks, contributors, and discussion will appear here soon!</p>
          </div>
        </article>
      </main>
    </div>
  );
}