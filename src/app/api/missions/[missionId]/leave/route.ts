import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { createSupabaseRouteHandlerClient } from '@/utils/supabase/route-handler-client';

export async function POST(
  request: NextRequest,
  context: { params: { missionId: string } }
) {
  const supabase = await createSupabaseRouteHandlerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const params = await context.params;
  const missionId = params.missionId;

  if (!missionId) {
    return NextResponse.json({ error: 'Mission ID is required' }, { status: 400 });
  }

  try {
    // Check if mission exists
    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
    });

    if (!mission) {
      return NextResponse.json({ error: 'Mission not found.' }, { status: 404 });
    }

    // Check if user is a participant
    const existingParticipation = await prisma.missionParticipant.findUnique({
      where: { missionId_userId: { missionId, userId: user.id } },
    });

    if (!existingParticipation) {
      return NextResponse.json({ error: 'You are not a participant of this mission.' }, { status: 400 });
    }

    // Remove user from participants
    await prisma.missionParticipant.delete({
      where: { missionId_userId: { missionId, userId: user.id } },
    });

    return NextResponse.json({ message: 'Successfully left mission.' }, { status: 200 });
  } catch (error) {
    console.error(`Error leaving mission ${missionId} for user ${user.id}:`, error);
    return NextResponse.json({ error: 'Failed to leave mission.' }, { status: 500 });
  }
} 