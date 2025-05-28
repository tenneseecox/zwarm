import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
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
});

const createCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty.").max(1000, "Comment is too long."),
});

export async function GET(
  request: NextRequest,
  context: { params: { missionId: string } }
) {
  const supabase = await createSupabaseRouteHandlerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const params = await context.params;
  const missionId = params.missionId;

  if (!missionId) {
    return NextResponse.json({ error: 'Mission ID is required' }, { status: 400 });
  }

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
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                emoji: true,
              },
            },
          },
        },
        tasks: {
          include: {
            creator: {
              select: {
                id: true,
                username: true,
                emoji: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },

        comments: {
          orderBy: { createdAt: 'asc' }, // Or 'desc'
          include: {
            user: {
              select: { id: true, username: true, emoji: true }
            }
          }
        },

        resources: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: { // User who added the resource
              select: { id: true, username: true, emoji: true }
            }
          }
        }
      },
    });

    if (!mission) {
      return NextResponse.json({ error: 'Mission not found.' }, { status: 404 });
    }

    // Add current user's participation status
    const currentUserIsParticipant = user ? mission.participants.some(p => p.userId === user.id) : false;

    return NextResponse.json({
      ...mission,
      currentUserIsParticipant,
    });
  } catch (error) {
    console.error(`Error fetching mission ${missionId}:`, error);
    return NextResponse.json({ error: 'Failed to fetch mission.' }, { status: 500 });
  }
}

export async function PUT(
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
    // Validate request body
    const body = await request.json();
    const validatedData = updateMissionSchema.parse(body);

    // Check if mission exists and user is owner
    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
    });

    if (!mission) {
      return NextResponse.json({ error: 'Mission not found.' }, { status: 404 });
    }

    if (mission.ownerId !== user.id) {
      return NextResponse.json({ error: 'Only the mission owner can update it.' }, { status: 403 });
    }

    // Update mission
    const updatedMission = await prisma.mission.update({
      where: { id: missionId },
      data: validatedData,
    });

    return NextResponse.json(updatedMission);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input.', details: error.errors }, { status: 400 });
    }
    console.error(`Error updating mission ${missionId}:`, error);
    return NextResponse.json({ error: 'Failed to update mission.' }, { status: 500 });
  }
}

export async function DELETE(
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
    // Check if mission exists and user is owner
    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
    });

    if (!mission) {
      return NextResponse.json({ error: 'Mission not found.' }, { status: 404 });
    }

    if (mission.ownerId !== user.id) {
      return NextResponse.json({ error: 'Only the mission owner can delete it.' }, { status: 403 });
    }

    // Delete mission
    await prisma.mission.delete({
      where: { id: missionId },
    });

    return NextResponse.json({ message: 'Mission deleted successfully.' });
  } catch (error) {
    console.error(`Error deleting mission ${missionId}:`, error);
    return NextResponse.json({ error: 'Failed to delete mission.' }, { status: 500 });
  }
}

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
    // Validate request body
    const body = await request.json();
    const validatedData = createCommentSchema.parse(body);

    // Check if mission exists
    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
    });

    if (!mission) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }

    // Create the new comment
    const newComment = await prisma.missionComment.create({
      data: {
        content: validatedData.content,
        missionId: missionId,
        userId: user.id,
      },
      include: {
        user: {
          select: { id: true, username: true, emoji: true }
        }
      }
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input for comment.', details: error.errors }, { status: 400 });
    }
    console.error(`Error creating comment for mission ${missionId}:`, error);
    return NextResponse.json({ error: 'Failed to create comment.' }, { status: 500 });
  }
} 