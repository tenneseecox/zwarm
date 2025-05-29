// src/app/dashboard/page.tsx
import { redirect } from 'next/navigation';
import Link from 'next/link';
// Ensure this is the Supabase client for Server Components, correctly using cookies()
import { createClient } from '@/utils/supabase/server';
import { Header } from '@/components/Header';
import { SwarmBackground } from '@/components/SwarmBackground';
import { MissionCard, type Mission as MissionCardType } from '@/components/MissionCard';
import { Button } from '@/components/ui/button';
import { cookies, headers } from 'next/headers'; // Keep this for the initial page auth check

type DashboardMission = MissionCardType;

async function fetchOwnedMissions(cookieStore: ReturnType<typeof cookies>): Promise<DashboardMission[]> {
  try {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const response = await fetch(`${protocol}://${host}/api/users/me/owned-missions`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Cookie': cookieStore.toString()
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to fetch owned missions:", response.status, errorText);
      throw new Error(`Failed to fetch owned missions: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching owned missions:", error);
    throw error; // Re-throw to handle in the component
  }
}

async function fetchJoinedMissions(cookieStore: ReturnType<typeof cookies>): Promise<DashboardMission[]> {
  try {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const response = await fetch(`${protocol}://${host}/api/users/me/joined-missions`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Cookie': cookieStore.toString()
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to fetch joined missions:", response.status, errorText);
      throw new Error(`Failed to fetch joined missions: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching joined missions:", error);
    throw error; // Re-throw to handle in the component
  }
}

// ... (rest of your DashboardPage component, it should remain the same)
export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/sign-in?message=Please sign in to view your dashboard.');
  }

  let ownedMissions: DashboardMission[] = [];
  let joinedMissions: DashboardMission[] = [];
  let error: string | null = null;

  try {
    [ownedMissions, joinedMissions] = await Promise.all([
      fetchOwnedMissions(cookieStore),
      fetchJoinedMissions(cookieStore),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : 'An error occurred while fetching missions';
    console.error('Dashboard error:', error);
  }

  return (
    <div className="min-h-screen bg-black-950 text-white">
      <SwarmBackground />
      <Header />
      <main className="relative z-10 container mx-auto px-4 py-12 md:py-16">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
            Your Dashboard
          </h1>
          <Link href="/missions/new">
            <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black-950 font-bold px-6 py-3 rounded-2xl transition-all duration-300 hover:scale-105 shadow-zwarm-glow">
              🚀 Launch New Mission
            </Button>
          </Link>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-500/50 rounded-2xl text-red-200">
            <p className="font-semibold">Error loading missions:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Missions You Own */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
              Missions You Own ({ownedMissions.length})
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-yellow-500/50 to-transparent"></div>
          </div>
          {ownedMissions.length === 0 ? (
            <div className="glass-dark rounded-2xl p-8 text-center border border-yellow-500/10">
              <p className="text-lg text-gray-300 mb-4">You haven&apos;t created any missions yet.</p>
              <Link 
                href="/missions/new" 
                className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors duration-300"
              >
                <span className="text-xl">🚀</span>
                Launch your first mission!
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {ownedMissions.map((mission) => (
                <MissionCard key={`owned-${mission.id}`} {...mission} />
              ))}
            </div>
          )}
        </section>

        {/* Missions You've Joined */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
              Missions You&apos;ve Joined ({joinedMissions.length})
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-yellow-500/50 to-transparent"></div>
          </div>
          {joinedMissions.length === 0 ? (
            <div className="glass-dark rounded-2xl p-8 text-center border border-yellow-500/10">
              <p className="text-lg text-gray-300 mb-4">You haven&apos;t joined any missions yet.</p>
              <Link 
                href="/missions" 
                className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors duration-300"
              >
                <span className="text-xl">🔍</span>
                Explore missions to join!
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {joinedMissions.map((mission) => (
                <MissionCard key={`joined-${mission.id}`} {...mission} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}