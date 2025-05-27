// src/app/api/missions/[id]/leave/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { createSupabaseRouteHandlerClient } from '@/utils/supabase/route-handler-client'; // Adjust path

interface RouteParams { params: { id: string } }

export async function POST(request: NextRequest, { params }: RouteParams) { // Using POST for simplicity
  const supabase = await createSupabaseRouteHandlerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const missionId = params.id;
  if (!missionId) {
    return NextResponse.json({ error: 'Mission ID is required' }, { status: 400 });
  }

  try {
    const existingParticipation = await prisma.missionParticipant.findUnique({
      where: { missionId_userId: { missionId, userId: user.id } },
    });

    if (!existingParticipation) {
      return NextResponse.json({ error: 'You are not a participant of this mission.' }, { status: 404 });
    }

    await prisma.missionParticipant.delete({
      where: { missionId_userId: { missionId, userId: user.id } },
    });

    return NextResponse.json({ message: 'Successfully left mission.' }, { status: 200 });
  } catch (error) {
    console.error(`Error leaving mission ${missionId} for user ${user.id}:`, error);
    return NextResponse.json({ error: 'Failed to leave mission.' }, { status: 500 });
  }
}