// src/app/api/missions/[id]/tasks/[taskId]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { createSupabaseRouteHandlerClient } from '@/utils/supabase/route-handler-client';
import { z } from 'zod';

interface RouteContext {
  params: {
    id: string; // missionId
    taskId: string;
  };
}

// Zod schema for task updates (e.g., only isCompleted for now)
const updateTaskSchema = z.object({
  isCompleted: z.boolean().optional(),
  text: z.string().min(1).max(500).optional(), // For future text editing
});

// --- PUT Handler: Update a Task (e.g., toggle completion, edit text) ---
export async function PUT(request: NextRequest, context: { params: RouteContext['params'] }) {
  const supabase = await createSupabaseRouteHandlerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const params = await context.params;
  const { id: missionId, taskId } = params;

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
      include: { mission: true }, // To check ownership or participation
    });

    if (!taskToUpdate || taskToUpdate.missionId !== missionId) {
      return NextResponse.json({ error: 'Task not found or does not belong to this mission.' }, { status: 404 });
    }

    // Authorization: Who can update tasks?
    // Option 1: Only mission owner
    // Option 2: Mission owner OR task creator
    // Option 3: Any participant (for toggling 'isCompleted')
    // For now, let's allow mission owner or task creator to update
    const isOwner = taskToUpdate.mission.ownerId === user.id;
    const isCreator = taskToUpdate.creatorId === user.id;

    if (!isOwner && !isCreator) { // Basic permission: owner or creator
        // For toggling 'isCompleted', you might have different rules (e.g., any participant)
        // For now, keeping it simple.
      return NextResponse.json({ error: 'Forbidden: You do not have permission to update this task.' }, { status: 403 });
    }
    
    const dataToUpdate: { text?: string; isCompleted?: boolean } = {};
    if (validatedData.text !== undefined) {
        // More restrictive permission for editing text (e.g., only owner or creator)
        if (!isOwner && !isCreator) {
             return NextResponse.json({ error: 'Forbidden: Only owner or creator can edit task text.' }, { status: 403 });
        }
        dataToUpdate.text = validatedData.text;
    }
    if (validatedData.isCompleted !== undefined) {
        // Potentially more lenient permission for toggling completion (e.g., any participant)
        // For this example, we'll stick to owner/creator for simplicity in this handler.
        // A separate endpoint or more complex logic would be needed for participant toggles if rules differ.
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

// --- DELETE Handler: Delete a Task ---
export async function DELETE(request: NextRequest, context: { params: RouteContext['params'] }) {
  const supabase = await createSupabaseRouteHandlerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const params = await context.params;
  const { id: missionId, taskId } = params;

  try {
    const taskToDelete = await prisma.missionTask.findUnique({
      where: { id: taskId },
      include: { mission: true }, // To check ownership
    });

    if (!taskToDelete || taskToDelete.missionId !== missionId) {
      return NextResponse.json({ error: 'Task not found or does not belong to this mission.' }, { status: 404 });
    }

    // Authorization: For now, let's assume only the mission owner or task creator can delete tasks
    if (taskToDelete.mission.ownerId !== user.id && taskToDelete.creatorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to delete this task.' }, { status: 403 });
    }

    await prisma.missionTask.delete({
      where: { id: taskId },
    });

    return NextResponse.json({ message: 'Task deleted successfully' }, { status: 200 });
    // Or return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Error deleting task ${taskId}:`, error);
    return NextResponse.json({ error: 'Failed to delete task.' }, { status: 500 });
  }
}