// src/app/missions/[id]/page.tsx
import { Header } from '@/components/Header'; //
import { SwarmBackground } from '@/components/SwarmBackground'; //
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge'; // Assuming you have Shadcn Badge: npx shadcn-ui@latest add badge

interface MissionDetailPageProps {
  params: {
    id: string; // This comes from the folder name [id]
  };
}

// Define a type for the single mission data, similar to FetchedMission
interface DetailedMission {
  id: string;
  title: string;
  description: string;
  emoji: string | null;
  status: string; // Or your MissionStatus enum if you transform it
  createdAt: string; // ISO string from DB
  updatedAt: string; // ISO string from DB
  owner?: {
    id: string;
    username: string | null;
    emoji: string | null;
  };
  // Add other fields as your API returns them
}

async function getMissionDetails(id: string): Promise<DetailedMission | null> {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${siteUrl}/api/missions/${id}`, {
      cache: 'no-store', // Or revalidate as needed
    });

    if (response.status === 404) {
      return null; // Mission not found
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
  const { id } = await params;
  const mission = await getMissionDetails(id);

  if (!mission) {
    notFound(); // Triggers Next.js 404 page
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
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>Status: </span> <Badge variant={mission.status === 'OPEN' ? 'default' : mission.status === 'COMPLETED' ? 'secondary' : 'outline'}
                                            className={mission.status === 'OPEN' ? 'bg-green-600 text-white' : mission.status === 'COMPLETED' ? 'bg-blue-600 text-white' : 'border-gray-600 text-gray-300'}>
                                        {mission.status}
                                     </Badge>
                <span>| Created: {new Date(mission.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed">
            {/* For rich text, you might render markdown here later */}
            <p>{mission.description}</p>
          </div>

          {/* Placeholder for future content: Tasks, Contributors, Discussion */}
          <div className="mt-10 border-t border-gray-700 pt-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Mission Control</h2>
            <p className="text-gray-400">Tasks, contributors, and discussion will appear here soon!</p>
          </div>
        </article>
      </main>
    </div>
  );
}