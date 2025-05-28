import { Button } from "@/components/ui/button";
import { MissionCard } from "@/components/MissionCard";
import { Header } from "@/components/Header";
import { SwarmBackground } from "@/components/SwarmBackground";
import { Suspense } from "react";
import { getAbsoluteUrl } from '@/utils/site-url';

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

  return (
    <div className="min-h-screen bg-black-950">
      <Suspense fallback={null}>
        <SwarmBackground />
      </Suspense>
      
      <Header />
      
      <main className="relative z-10 px-4">
        {/* Hero Section */}
        <section className="mt-16 mb-10 text-center max-w-3xl mx-auto">
          <div className="glass-dark rounded-2xl p-12 relative overflow-hidden animate-fadeInUp">
            {/* Bee Icon */}
            <div className="text-4xl bg-yellow-500 rounded-full p-4 w-16 h-16 mx-auto mb-4 shadow-zwarm-glow border-2 border-yellow-100 animate-bounce flex items-center justify-center text-black font-black">
              🐝
            </div>
            
            {/* Hero Title */}
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-white leading-tight">
              Swarm the Internet.<br />
              Build <span className="text-yellow-400 text-glow-yellow">Missions</span> Together.
            </h1>
            
            {/* Hero Description */}
            <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
              Zwarm is where internet strangers unite to create, build, and solve together.<br />
              <span className="text-white font-bold">Pick a mission. Join the swarm. Make an impact.</span>
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-blue-400 hover:bg-blue-300 text-white font-bold px-8 py-4 rounded-zwarm transition-all hover:scale-105"
              >
                View a Mission
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black font-bold px-8 py-4 rounded-zwarm transition-all hover:scale-105"
              >
                See Trending
              </Button>
            </div>
          </div>
        </section>

        {/* Trending Missions */}
        <section className="max-w-6xl mx-auto mb-16">
          <h2 className="text-2xl font-bold mb-6 text-white">🔥 Trending Missions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {missions.map((mission) => (
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
