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

    // Check if user is already a participant
    const existingParticipation = await prisma.missionParticipant.findUnique({
      where: { missionId_userId: { missionId, userId: user.id } },
    });

    if (existingParticipation) {
      return NextResponse.json({ error: 'You are already a participant of this mission.' }, { status: 400 });
    }

    // Add user as participant
    await prisma.missionParticipant.create({
      data: {
        missionId,
        userId: user.id,
      },
    });

    return NextResponse.json({ message: 'Successfully joined mission.' }, { status: 200 });
  } catch (error) {
    console.error(`Error joining mission ${missionId} for user ${user.id}:`, error);
    return NextResponse.json({ error: 'Failed to join mission.' }, { status: 500 });
  }
} 