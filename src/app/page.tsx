import { Button } from "@/components/ui/button";
import { MissionCard, type Mission as MissionCardType } from "@/components/MissionCard";
import { Header } from "@/components/Header";
import { SwarmBackground } from "@/components/SwarmBackground";
import { Suspense } from "react";
import { getAbsoluteUrl } from '@/utils/site-url';
import { formatTimeAgo } from '@/utils/time-helpers';

interface MissionOwner {
  id: string;
  username: string | null;
  emoji: string | null;
}

interface Mission {
  id: string;
  title: string;
  description: string;
  emoji: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  owner: MissionOwner;
  tags: string[];
  _count: {
    participants: number;
  };
}

// Transform API mission to MissionCard props
function transformMissionForCard(mission: Mission): MissionCardType {
  return {
    id: mission.id,
    title: mission.title,
    description: mission.description,
    emoji: mission.emoji || '❓',
    tags: mission.tags || [],
    contributors: mission._count?.participants ?? 0,
    timeAgo: formatTimeAgo(new Date(mission.createdAt)),
    status: mission.status,
  };
}

// Server Component for mission data
async function getTrendingMissions(): Promise<Mission[]> {
  try {
    const response = await fetch(getAbsoluteUrl('/api/missions'), {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) {
      console.error("Failed to fetch trending missions:", response.status, await response.text());
      return [];
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching trending missions:", error);
    return [];
  }
}

export default async function Home() {
  const missions = await getTrendingMissions();
  const transformedMissions = missions.map(transformMissionForCard);

  return (
    <div className="min-h-screen bg-black-950">
      <Suspense fallback={null}>
        <SwarmBackground />
      </Suspense>
      
      <Header />
      
      <main className="relative z-10 px-4">
        {/* Hero Section */}
        <section className="mt-16 mb-12 text-center max-w-3xl mx-auto">
          <div className="glass-dark rounded-2xl p-12 relative overflow-hidden border border-yellow-500/10 hover:border-yellow-500/20 transition-all duration-300">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl"></div>
            </div>
            
            {/* Bee Icon */}
            <div className="text-4xl bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-4 w-16 h-16 mx-auto mb-6 shadow-zwarm-glow border-2 border-yellow-100 transform hover:scale-105 transition-transform duration-300 flex items-center justify-center text-black font-black relative z-10">
              🐝
            </div>
            
            {/* Hero Title */}
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-white leading-tight relative z-10">
              Swarm the Internet.<br />
              Build <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">Missions</span> Together.
            </h1>
            
            {/* Hero Description */}
            <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed relative z-10">
              Zwarm is where internet strangers unite to create, build, and solve together.<br />
              <span className="text-white font-bold">Pick a mission. Join the swarm. Make an impact.</span>
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black-950 font-bold px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105 shadow-zwarm-glow hover:shadow-zwarm-glow-lg"
              >
                View a Mission
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 font-bold px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105 hover:border-yellow-400"
              >
                See Trending
              </Button>
            </div>
          </div>
        </section>

        {/* Trending Missions */}
        <section className="max-w-6xl mx-auto mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center gap-2">
              <span className="text-2xl animate-pulse">🔥</span>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                Trending Missions
              </h2>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-yellow-500/50 to-transparent"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {transformedMissions.map((mission) => (
              <MissionCard
                key={mission.id}
                {...mission}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
