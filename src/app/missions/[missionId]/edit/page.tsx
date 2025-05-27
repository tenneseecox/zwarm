// src/app/missions/[missionId]/edit/page.tsx
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { Header } from '@/components/Header';
import { SwarmBackground } from '@/components/SwarmBackground';
import { EditMissionForm } from '@/components/EditMissionForm';
import type { DetailedMission } from '../page';

interface EditMissionPageProps {
  params: { missionId: string };
}

async function getMissionForEdit(missionId: string): Promise<DetailedMission | null> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  try {
    const response = await fetch(`${siteUrl}/api/missions/${missionId}`, { cache: 'no-store' });
    if (!response.ok) return null;
    return await response.json();
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
        <div className="max-w-2xl mx-auto glass-dark p-6 md:p-8 rounded-zwarm shadow-zwarm-dark">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center text-yellow-400">
            Edit Your Mission
          </h1>
          <EditMissionForm mission={mission} />
        </div>
      </main>
    </div>
  );
}