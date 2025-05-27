// src/app/missions/[id]/edit/page.tsx
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { Header } from '@/components/Header';
import { SwarmBackground } from '@/components/SwarmBackground';
import { EditMissionForm } from '@/components/EditMissionForm'; // We will create this next
import type { DetailedMission } from '../page'; // Assuming DetailedMission type is exported from your detail page or a shared types file

// Re-using or adapting getMissionDetails from your detail page for server-side fetch
async function getMissionForEdit(id: string): Promise<DetailedMission | null> {
  // This should ideally fetch directly using Prisma or a server-side data lib,
  // or call your API. For simplicity, let's assume a similar fetch to getMissionDetails.
  // Ensure it fetches all fields needed for the form (title, desc, emoji, tags, status).
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  try {
    const response = await fetch(`${siteUrl}/api/missions/${id}`, { cache: 'no-store' });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Error fetching mission for edit:", error);
    return null;
  }
}

interface EditMissionPageProps {
  params: { id: string };
}

export default async function EditMissionPage({ params }: EditMissionPageProps) {
  const missionId = params.id;

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
    // You could redirect to an unauthorized page or back to the mission detail page
    // For now, let's show notFound, but a "Forbidden" message is better.
    // Consider redirecting: redirect(`/missions/${missionId}?error=unauthorized`);
    notFound(); // Or a dedicated "Forbidden" component
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