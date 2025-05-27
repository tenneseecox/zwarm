// src/app/api/missions/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
// Assuming your Supabase client helper path
import { createSupabaseRouteHandlerClient } from '@/utils/supabase/route-handler-client';
import { z } from 'zod';

const updateMissionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long.").max(100),
  description: z.string().min(10, "Description must be at least 10 characters long.").max(5000),
  emoji: z.string().optional(),
  tags: z.array(
          z.string()
            .min(1, { message: "Tag cannot be empty." })
            .max(25, { message: "Tag cannot be longer than 25 characters." })
            .regex(/^[a-zA-Z0-9-]+$/, { message: "Tag can only contain letters, numbers, and hyphens." })
        )
        .max(5, { message: "You can add a maximum of 5 tags." })
        .optional()
        .default([]),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED']).optional(), // If you allow status updates here
});


export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id: missionId } = await params;

  if (!missionId) {
    return NextResponse.json({ error: 'Mission ID is required.' }, { status: 400 });
  }

  const supabase = await createSupabaseRouteHandlerClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  try {
    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            emoji: true,
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
        participants: {
          orderBy: {
            joinedAt: 'asc',
          },
          select: {
            joinedAt: true,
            user: {
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

    return NextResponse.json({ ...mission, currentUserIsParticipant }, { status: 200 });

  } catch (error) {
    console.error('Error fetching mission:', error);
    return NextResponse.json({ error: 'Failed to fetch mission.' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createSupabaseRouteHandlerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const missionId = params.id;
  if (!missionId) {
    return NextResponse.json({ error: 'Mission ID is required' }, { status: 400 });
  }

  // 1. Validate request body
  let validatedData;
  try {
    const body = await request.json();
    validatedData = updateMissionSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input.', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  try {
    // 2. Check if the mission exists and if the current user is the owner
    const missionToUpdate = await prisma.mission.findUnique({
      where: { id: missionId },
    });

    if (!missionToUpdate) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }

    if (missionToUpdate.ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden: You are not the owner of this mission' }, { status: 403 });
    }

    // 3. Update the mission
    const updatedMission = await prisma.mission.update({
      where: { id: missionId },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        emoji: validatedData.emoji,
        tags: validatedData.tags,
        // ownerId remains unchanged
        // createdAt remains unchanged
        // updatedAt will be automatically handled by Prisma's @updatedAt (if you have it)
        // If not using @updatedAt, you'd add: updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedMission, { status: 200 });
  } catch (error) {
    console.error(`Error updating mission ${missionId}:`, error);
    return NextResponse.json({ error: 'Failed to update mission.' }, { status: 500 });
  }
}

// --- DELETE Handler: Delete an existing Mission ---
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    // 1. Check if the mission exists and if the current user is the owner
    const missionToDelete = await prisma.mission.findUnique({
      where: { id: missionId },
    });

    if (!missionToDelete) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }

    if (missionToDelete.ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden: You are not the owner of this mission' }, { status: 403 });
    }

    // 2. Delete the mission
    // Ensure cascade delete is set up in your Prisma schema for related MissionParticipant records
    // (e.g., onDelete: Cascade on the relation in MissionParticipant model)
    await prisma.mission.delete({
      where: { id: missionId },
    });

    return NextResponse.json({ message: 'Mission deleted successfully' }, { status: 200 });
    // Alternatively, return status 204 (No Content) which is common for DELETE
    // return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error(`Error deleting mission ${missionId}:`, error);
    // Handle potential Prisma errors, e.g., if related records prevent deletion
    // without proper cascade rules.
    return NextResponse.json({ error: 'Failed to delete mission.' }, { status: 500 });
  }
}
