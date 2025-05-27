import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { createSupabaseRouteHandlerClient } from '@/utils/supabase/route-handler-client';
import { z } from 'zod';

const createTaskSchema = z.object({
  text: z.string().min(1, "Task text cannot be empty.").max(500, "Task text can be at most 500 characters."),
});

interface RouteContext {
  params: {
    missionId: string;
  };
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  const supabase = await createSupabaseRouteHandlerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const missionId = context.params.missionId;
  if (!missionId) {
    return NextResponse.json({ error: 'Mission ID is required' }, { status: 400 });
  }

  // Validate request body
  let validatedData;
  try {
    const body = await request.json();
    validatedData = createTaskSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input for task.', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Invalid request body for task.' }, { status: 400 });
  }

  try {
    // Optional: Check if the mission exists and if the user is the owner (or participant, depending on rules)
    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
    });

    if (!mission) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }

    // Authorization: For now, let's assume only the mission owner can create tasks
    if (mission.ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden: Only the mission owner can add tasks' }, { status: 403 });
    }

    // Create the new task
    const newTask = await prisma.missionTask.create({
      data: {
        text: validatedData.text,
        missionId: missionId,
        creatorId: user.id,
        // isCompleted defaults to false as per schema
      },
      include: { // Return the created task with creator details
        creator: {
          select: { id: true, username: true, emoji: true }
        }
      }
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error(`Error creating task for mission ${missionId}:`, error);
    return NextResponse.json({ error: 'Failed to create task.' }, { status: 500 });
  }
} 