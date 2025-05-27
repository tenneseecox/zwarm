// src/app/api/missions/[id]/join/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { createSupabaseRouteHandlerClient } from '@/utils/supabase/route-handler-client'; // Adjust path if needed

// Keep the interface for clarity/documentation if you like, but don't use it directly in the function signature type.
// interface RouteParams {
//   params: {
//     id: string;
//   };
// }

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } } // Correctly type the second argument structure
) {
  const supabase = await createSupabaseRouteHandlerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  // Access missionId directly from params object
  const missionId = params.id; // Access from the destructured params

  if (!missionId) {
    return NextResponse.json({ error: 'Mission ID is required' }, { status: 400 });
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
    // Consider more specific error handling for Prisma unique constraint violations if needed,
    // though the check for existingParticipation should catch most legitimate "already joined" cases.
    return NextResponse.json({ error: 'Failed to join mission.' }, { status: 500 });
  }
}