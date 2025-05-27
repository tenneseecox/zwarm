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
  isCompleted: z.boolean().optional(),
  text: z.string().min(1).max(500).optional(),
});

export async function PUT(request: NextRequest, context: { params: RouteContext['params'] }) {
  const supabase = await createSupabaseRouteHandlerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const params = await context.params;
  const { missionId, taskId } = params;

  let validatedData;
  try {
    const body = await request.json();
    validatedData = updateTaskSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input for task update.', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  try {
    const taskToUpdate = await prisma.missionTask.findUnique({
      where: { id: taskId },
      include: { mission: true },
    });

    if (!taskToUpdate || taskToUpdate.missionId !== missionId) {
      return NextResponse.json({ error: 'Task not found or does not belong to this mission.' }, { status: 404 });
    }

    const isOwner = taskToUpdate.mission.ownerId === user.id;
    const isCreator = taskToUpdate.creatorId === user.id;

    if (!isOwner && !isCreator) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to update this task.' }, { status: 403 });
    }
    
    const dataToUpdate: { text?: string; isCompleted?: boolean } = {};
    if (validatedData.text !== undefined) {
      if (!isOwner && !isCreator) {
        return NextResponse.json({ error: 'Forbidden: Only owner or creator can edit task text.' }, { status: 403 });
      }
      dataToUpdate.text = validatedData.text;
    }
    if (validatedData.isCompleted !== undefined) {
      dataToUpdate.isCompleted = validatedData.isCompleted;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ error: 'No update data provided.' }, { status: 400 });
    }

    const updatedTask = await prisma.missionTask.update({
      where: { id: taskId },
      data: dataToUpdate,
      include: { creator: { select: { id: true, username: true, emoji: true } } },
    });

    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    console.error(`Error updating task ${taskId}:`, error);
    return NextResponse.json({ error: 'Failed to update task.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: RouteContext['params'] }) {
  const supabase = await createSupabaseRouteHandlerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const params = await context.params;
  const { missionId, taskId } = params;

  try {
    const taskToDelete = await prisma.missionTask.findUnique({
      where: { id: taskId },
      include: { mission: true },
    });

    if (!taskToDelete || taskToDelete.missionId !== missionId) {
      return NextResponse.json({ error: 'Task not found or does not belong to this mission.' }, { status: 404 });
    }

    if (taskToDelete.mission.ownerId !== user.id && taskToDelete.creatorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to delete this task.' }, { status: 403 });
    }

    await prisma.missionTask.delete({
      where: { id: taskId },
    });

    return NextResponse.json({ message: 'Task deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting task ${taskId}:`, error);
    return NextResponse.json({ error: 'Failed to delete task.' }, { status: 500 });
  }
} 