import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { createSupabaseRouteHandlerClient } from '@/utils/supabase/route-handler-client';
import { z } from 'zod';

interface RouteContext {
  params: {
    missionId: string;
    taskId: string;
  };
}

const updateTaskSchema = z.object({
  text: z.string().min(1, "Task text cannot be empty.").max(500).optional(),
  isCompleted: z.boolean().optional(),
}).refine(data => data.text !== undefined || data.isCompleted !== undefined, {
  message: "At least one field (text or isCompleted) must be provided for update"
});

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  const supabase = await createSupabaseRouteHandlerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const params = await context.params;
  const { missionId, taskId } = params;

  if (!missionId || !taskId) {
    return NextResponse.json({ error: 'Mission ID and Task ID are required.' }, { status: 400 });
  }

  try {
    // Validate request body
    const body = await request.json();
    const validatedData = updateTaskSchema.parse(body);

    // Check if task exists
    const task = await prisma.missionTask.findUnique({
      where: { id: taskId },
      include: {
        mission: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found.' }, { status: 404 });
    }

    // Verify task belongs to the specified mission
    if (task.missionId !== missionId) {
      return NextResponse.json({ error: 'Task does not belong to the specified mission.' }, { status: 400 });
    }

    // Check if user is the task creator or mission owner
    if (task.creatorId !== user.id && task.mission.ownerId !== user.id) {
      return NextResponse.json({ error: 'You do not have permission to update this task.' }, { status: 403 });
    }

    // Update the task with only the provided fields
    const updatedTask = await prisma.missionTask.update({
      where: { id: taskId },
      data: {
        ...(validatedData.text !== undefined && { text: validatedData.text }),
        ...(validatedData.isCompleted !== undefined && { isCompleted: validatedData.isCompleted }),
      },
      include: {
        creator: {
          select: { id: true, username: true, emoji: true },
        },
      },
    });

    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input.', details: error.errors }, { status: 400 });
    }
    console.error(`Error updating task ${taskId} in mission ${missionId}:`, error);
    return NextResponse.json({ error: 'Failed to update task.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  const supabase = await createSupabaseRouteHandlerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const params = await context.params;
  const { missionId, taskId } = params;

  if (!missionId || !taskId) {
    return NextResponse.json({ error: 'Mission ID and Task ID are required.' }, { status: 400 });
  }

  try {
    // Check if task exists
    const task = await prisma.missionTask.findUnique({
      where: { id: taskId },
      include: {
        mission: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found.' }, { status: 404 });
    }

    // Verify task belongs to the specified mission
    if (task.missionId !== missionId) {
      return NextResponse.json({ error: 'Task does not belong to the specified mission.' }, { status: 400 });
    }

    // Check if user is the task creator or mission owner
    if (task.creatorId !== user.id && task.mission.ownerId !== user.id) {
      return NextResponse.json({ error: 'You do not have permission to delete this task.' }, { status: 403 });
    }

    // Delete the task
    await prisma.missionTask.delete({
      where: { id: taskId },
    });

    return NextResponse.json({ message: 'Task deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting task ${taskId} from mission ${missionId}:`, error);
    return NextResponse.json({ error: 'Failed to delete task.' }, { status: 500 });
  }
} 