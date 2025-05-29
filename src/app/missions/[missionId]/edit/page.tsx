// src/app/missions/[missionId]/edit/page.tsx
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { Header } from '@/components/Header';
import { SwarmBackground } from '@/components/SwarmBackground';
import { EditMissionForm } from '@/components/EditMissionForm';
import type { DetailedMission } from '../page';
import { getAbsoluteUrl } from '@/utils/site-url';

interface EditMissionPageProps {
  params: { missionId: string };
}

async function getMissionForEdit(missionId: string): Promise<DetailedMission | null> {
  try {
    const response = await fetch(getAbsoluteUrl(`/api/missions/${missionId}`), {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) {
      console.error("Failed to fetch mission for edit:", response.status, await response.text());
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching mission for edit:", error);
    return null;
  }
}

export default async function EditMissionPage({ params }: EditMissionPageProps) {
  const { missionId } = await params;

  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect(`/sign-in?next=/missions/${missionId}/edit`);
  }

  const mission = await getMissionForEdit(missionId);

  if (!mission) {
    notFound();
  }

  // Authorization: Check if the current user is the owner
  if (mission.owner?.id !== user.id) {
    redirect(`/missions/${missionId}?error=unauthorized`);
  }

  return (
    <div className="min-h-screen bg-black-950 text-white">
      <SwarmBackground />
      <Header />
      <main className="relative z-10 container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-2xl mx-auto">
          <div className="glass-dark rounded-2xl p-8 shadow-zwarm-dark border border-yellow-500/10 hover:border-yellow-500/20 transition-all duration-300">
            <div className="flex items-center gap-3 mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                Edit Your Mission
              </h1>
              <div className="h-px flex-1 bg-gradient-to-r from-yellow-500/50 to-transparent"></div>
            </div>
            <EditMissionForm mission={mission} />
          </div>
        </div>
      </main>
    </div>
  );
}