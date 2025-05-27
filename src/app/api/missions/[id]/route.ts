// src/app/api/missions/[id]/route.ts

import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { createSupabaseRouteHandlerClient } from '@/utils/supabase/route-handler-client'; // Adjust path as per your project

interface RouteParams {
  params: {
    id: string;
  };
}

// --- GET Handler: Fetch a single Mission by ID ---
export async function GET(request: NextRequest, { params }: RouteParams) {
  // Using 'await params' as per your existing structure.
  // Ensure 'params' is indeed awaitable in your context if this was a specific fix.
  // Typically, for { params }, params.id is directly accessible.
  const { id: missionId } = await params;

  if (!missionId) {
    return NextResponse.json({ error: 'Mission ID is required.' }, { status: 400 });
  }

  // Initialize Supabase client to get current user context
  const supabase = await createSupabaseRouteHandlerClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  try {
    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
      include: {
        owner: { // Include details about the mission owner
          select: {
            id: true,
            username: true,
            emoji: true,
          },
        },
        _count: { // Include the count of participants
          select: {
            participants: true, // Assumes relation on Mission model is named 'participants'
                                // linking to a MissionParticipant model
          },
        },
      },
    });

    if (!mission) {
      return NextResponse.json({ error: 'Mission not found.' }, { status: 404 });
    }

    let currentUserIsParticipant = false;
    if (currentUser && mission) { // Check if there's a logged-in user and mission exists
      const participation = await prisma.missionParticipant.findUnique({
        where: {
          missionId_userId: { // This assumes your @@unique constraint is named this or similar
            missionId: mission.id,
            userId: currentUser.id,
          },
        },
      });
      currentUserIsParticipant = !!participation;
    }

    // Add the participation status to the mission object before sending
    const missionWithParticipation = {
      ...mission,
      currentUserIsParticipant,
    };

    return NextResponse.json(missionWithParticipation, { status: 200 });

  } catch (error) {
    console.error(`Error fetching mission ${missionId}:`, error);
    
    // Your existing error handling for invalid ID format
    type PrismaError = { code?: string; message?: string };
    const isMalformedIdError = (err: unknown): boolean => {
        if (typeof err === 'object' && err !== null) {
            const prismaError = err as PrismaError;
            return (prismaError.code === 'P2023' || // Prisma error for malformed ID / non-UUID
                   (typeof prismaError.message === 'string' && 
                    (prismaError.message.includes('Malformed ObjectID') || // MongoDB specific
                     prismaError.message.includes("Invalid `prisma.mission.findUnique()` invocation")) // General Prisma client error if ID is bad
                   )
                  );
        }
        return false;
    };

    if (isMalformedIdError(error)) {
      return NextResponse.json({ error: 'Invalid Mission ID format.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to fetch mission.' }, { status: 500 });
  }
}

// Later, you can add PUT (update) and DELETE handlers in this same file.
// export async function PUT(request: NextRequest, { params }: RouteParams) { /* ... */ }
// export async function DELETE(request: NextRequest, { params }: RouteParams) { /* ... */ }