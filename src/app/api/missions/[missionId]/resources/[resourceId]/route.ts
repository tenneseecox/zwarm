// src/app/api/missions/[missionId]/resources/[resourceId]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma'; //
import { createSupabaseRouteHandlerClient } from '@/utils/supabase/route-handler-client'; ///tasks/[taskId]/route.ts]

interface DeleteRouteContext {
  params: {
    missionId: string;
    resourceId: string;
  };
}

export async function DELETE(request: NextRequest, context: DeleteRouteContext) {
  const supabase = await createSupabaseRouteHandlerClient(); ///tasks/[taskId]/route.ts]
  const { data: { user }, error: authError } = await supabase.auth.getUser(); ///tasks/[taskId]/route.ts]

  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 }); ///tasks/[taskId]/route.ts]
  }

  const { missionId, resourceId } = context.params;

  if (!missionId || !resourceId) {
    return NextResponse.json({ error: 'Mission ID and Resource ID are required' }, { status: 400 });
  }

  try {
    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
    });

    if (!mission) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }

    if (mission.ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden: Only the mission owner can delete resources' }, { status: 403 });
    }

    const resourceToDelete = await prisma.missionResource.findUnique({
        where: { id: resourceId, missionId: missionId }
    });

    if (!resourceToDelete) {
        return NextResponse.json({ error: 'Resource not found or does not belong to this mission' }, { status: 404});
    }

    await prisma.missionResource.delete({
      where: { id: resourceId },
    });

    return NextResponse.json({ message: 'Resource deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting resource ${resourceId} for mission ${missionId}:`, error);
    return NextResponse.json({ error: 'Failed to delete resource.' }, { status: 500 });
  }
}