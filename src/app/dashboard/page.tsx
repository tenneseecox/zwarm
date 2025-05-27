// src/app/dashboard/page.tsx
import { redirect } from 'next/navigation';
import Link from 'next/link';
// Ensure this is the Supabase client for Server Components, correctly using cookies()
import { createClient } from '@/utils/supabase/server';
import { Header } from '@/components/Header';
import { SwarmBackground } from '@/components/SwarmBackground';
import { MissionCard, type Mission as MissionCardType } from '@/components/MissionCard';
import { Button } from '@/components/ui/button';
import { cookies } from 'next/headers'; // Keep this for the initial page auth check

type DashboardMission = MissionCardType;

async function fetchOwnedMissions(): Promise<DashboardMission[]> {
  const pageCookieStore = await cookies();
  const cookieHeader = Array.from(pageCookieStore.getAll()).map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  try {
    const response = await fetch(`${siteUrl}/api/users/me/owned-missions`, {
      cache: 'no-store',
      headers: {
        'Cookie': cookieHeader,
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to fetch owned missions (page):", response.status, errorText);
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error("Error in fetchOwnedMissions (page catch block):", error);
    return [];
  }
}

async function fetchJoinedMissions(): Promise<DashboardMission[]> {
  const pageCookieStore = await cookies();
  const cookieHeader = Array.from(pageCookieStore.getAll()).map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  try {
    const response = await fetch(`${siteUrl}/api/users/me/joined-missions`, {
      cache: 'no-store',
      headers: {
        'Cookie': cookieHeader,
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to fetch joined missions (page):", response.status, errorText);
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error("Error in fetchJoinedMissions (page catch block):", error);
    return [];
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

  const [ownedMissions, joinedMissions] = await Promise.all([
    fetchOwnedMissions(),
    fetchJoinedMissions(),
  ]);

  return (
    <div className="min-h-screen bg-black-950 text-white">
      <SwarmBackground />
      <Header />
      <main className="relative z-10 container mx-auto px-4 py-12 md:py-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-yellow-400">
            Your Dashboard
          </h1>
           <Link href="/missions/new">
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-black-950 font-bold py-2 px-4 rounded-lg">
              🚀 Launch New Mission
            </Button>
          </Link>
        </div>

        {/* Missions You Own */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6 border-b-2 border-yellow-400 pb-2">
            Missions You Own ({ownedMissions.length})
          </h2>
          {ownedMissions.length === 0 ? (
            <div className="text-center text-gray-400 py-6 glass-dark rounded-zwarm">
              <p className="text-lg">You haven&apos;t created any missions yet.</p>
              <Link href="/missions/new" className="text-yellow-400 hover:text-yellow-300 underline mt-2 inline-block">
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
          <h2 className="text-2xl font-semibold text-white mb-6 border-b-2 border-yellow-400 pb-2">
            Missions You&apos;ve Joined ({joinedMissions.length})
          </h2>
          {joinedMissions.length === 0 ? (
            <div className="text-center text-gray-400 py-6 glass-dark rounded-zwarm">
              <p className="text-lg">You haven&apos;t joined any missions yet.</p>
              <Link href="/missions" className="text-yellow-400 hover:text-yellow-300 underline mt-2 inline-block">
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