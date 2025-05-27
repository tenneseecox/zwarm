// src/app/api/missions/[id]/join/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
// Ensure this path is correct and the helper is correctly defined and exported
import { createSupabaseRouteHandlerClient } from '@/utils/supabase/route-handler-client';

// Define an interface for the context object passed as the second argument
interface RouteContext {
  params: {
    id: string; // This corresponds to the [id] dynamic segment in your route
  };
}

export async function POST(
  request: NextRequest,
  context: RouteContext // Use the explicitly typed context object here
) {
  const supabase = await createSupabaseRouteHandlerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  // Access 'id' from context.params
  const missionId = context.params.id;

  if (!missionId) {
    // This check is generally good practice, though Next.js usually ensures params.id is a string.
    return NextResponse.json({ error: 'Mission ID is required in the path' }, { status: 400 });
  }

  try {
    const missionExists = await prisma.mission.findUnique({ where: { id: missionId } });
    if (!missionExists) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }

    const existingParticipation = await prisma.missionParticipant.findUnique({
      where: { missionId_userId: { missionId, userId: user.id } },
    });

    if (existingParticipation) {
      return NextResponse.json({ message: 'You have already joined this mission.', participant: existingParticipation }, { status: 200 });
    }

    const newParticipant = await prisma.missionParticipant.create({
      data: { missionId, userId: user.id },
    });

    return NextResponse.json({ message: 'Successfully joined mission!', participant: newParticipant }, { status: 201 });
  } catch (error) {
    console.error(`Error joining mission ${missionId} for user ${user.id}:`, error);
    return NextResponse.json({ error: 'Failed to join mission.' }, { status: 500 });
  }
}