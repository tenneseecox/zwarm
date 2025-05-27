// src/app/api/missions/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
// Assuming your Supabase client helper path
import { createSupabaseRouteHandlerClient } from '@/utils/supabase/route-handler-client';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const missionId = params.id;

  if (!missionId) {
    return NextResponse.json({ error: 'Mission ID is required.' }, { status: 400 });
  }

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
        _count: { // Keep the count of participants
          select: {
            participants: true, // Assumes relation on Mission model is 'participants'
          },
        },
        participants: { // <-- NEW: Include the actual participants list
          orderBy: {
            joinedAt: 'asc', // Optional: Order by when they joined
          },
          select: {
            joinedAt: true, // Optional: if you want to show join date
            user: {         // Select details of the participating user
              select: {
                id: true,
                username: true,
                emoji: true,
              },
            },
          },
        },
      },
    });

    if (!mission) {
      return NextResponse.json({ error: 'Mission not found.' }, { status: 404 });
    }

    let currentUserIsParticipant = false;
    if (currentUser && mission) {
      // This check can remain, or you could derive it from the fetched 'participants' list on the client
      // For consistency, keeping it here is fine.
      const participationRecord = await prisma.missionParticipant.findUnique({
        where: {
          missionId_userId: {
            missionId: mission.id,
            userId: currentUser.id,
          },
        },
      });
      currentUserIsParticipant = !!participationRecord;
    }

    // The 'mission' object now includes owner, _count, the full participants list, and tags (by default)
    return NextResponse.json({ ...mission, currentUserIsParticipant }, { status: 200 });

  } catch (error) {
    console.error('Error fetching mission:', error);
    // Your existing error handling for invalid ID format
    type PrismaError = { code?: string; message?: string };
    const isMalformedIdError = (err: unknown): boolean => {
        if (typeof err === 'object' && err !== null) {
            const prismaError = err as PrismaError;
            return (prismaError.code === 'P2023' ||
                   (typeof prismaError.message === 'string' &&
                    (prismaError.message.includes('Malformed ObjectID') ||
                     prismaError.message.includes("Invalid `prisma.mission.findUnique()` invocation"))
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