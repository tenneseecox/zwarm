import { Button } from "@/components/ui/button";
import { MissionCard } from "@/components/MissionCard";
import { Header } from "@/components/Header";
import { SwarmBackground } from "@/components/SwarmBackground";
import { Suspense } from "react";

// Server Component for mission data
async function getTrendingMissions() {
  return   [
    {
      id: "1",
      emoji: "🔍",
      title: "Open Source AI Detector",
      description: "Build a free tool to spot AI-generated images and text. Designers, coders, and activists welcome!",
      contributors: 18,
      timeAgo: "2d"
    },
    {
      id: "2",
      emoji: "🎨",
      title: "Public Domain Art Archive",
      description: "Crowdsource a database of public domain art for everyone to use and remix.",
      contributors: 12,
      timeAgo: "1d"
    },
    {
      id: "3",
      emoji: "🌱",
      title: "Green City Map",
      description: "Map every public park and green space in your city, together.",
      contributors: 9,
      timeAgo: "3d"
    },
    {
      id: "4",
      emoji: "🧠",
      title: "Open Source Brainstorm",
      description: "Collaborate on wild new ideas for open source projects. Anything goes!",
      contributors: 22,
      timeAgo: "5h"
    },
    {
      id: "5",
      emoji: "📚",
      title: "Collaborative E-Book Library",
      description: "Create and curate a collection of open-source and public domain e-books.",
      contributors: 15,
      timeAgo: "1d"
    },
    {
      id: "6",
      emoji: "🎶",
      title: "Open Music Remix Platform",
      description: "Build a platform for remixing and sharing open-license music tracks.",
      contributors: 8,
      timeAgo: "2d"
    },
    {
      id: "7",
      emoji: "💡",
      title: "DIY Project Hub",
      description: "Share and document open-source hardware and DIY projects.",
      contributors: 10,
      timeAgo: "3d"
    },
    {
      id: "8",
      emoji: "📝",
      title: "Community Writing Project",
      description: "Collaboratively write stories, articles, or documentation on a chosen topic.",
      contributors: 14,
      timeAgo: "6h"
    },
    {
      id: "9",
      emoji: "🌍",
      title: "Citizen Science Data Collection",
      description: "Develop tools and protocols for crowdsourcing scientific data.",
      contributors: 11,
      timeAgo: "4d"
    },
    {
      id: "10",
      emoji: "🎮",
      title: "Open Source Game Development",
      description: "Team up to build a new open-source video game from scratch.",
      contributors: 25,
      timeAgo: "8h"
    },
    {
      id: "11",
      emoji: "🛠️",
      title: "Open Hardware Designs",
      description: "Share and iterate on designs for open-source physical objects and tools.",
      contributors: 7,
      timeAgo: "2d"
    },
    {
      id: "12",
      emoji: "💬",
      title: "Language Learning Exchange",
      description: "Create a platform for language learners to connect and practice with native speakers.",
      contributors: 19,
      timeAgo: "1d"
    }
  ];

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
