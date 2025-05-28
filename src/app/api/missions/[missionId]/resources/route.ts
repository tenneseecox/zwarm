import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma'; //
import { createSupabaseRouteHandlerClient } from '@/utils/supabase/route-handler-client'; ///tasks/[taskId]/route.ts]
import { z } from 'zod'; //

const createResourceSchema = z.object({
  title: z.string().min(1, "Title cannot be empty.").max(100),
  url: z.string().url("Must be a valid URL (e.g., http://example.com).").max(500),
  description: z.string().max(500).optional(),
  emoji: z.string().optional(),
});

interface PostRouteContext {
  params: {
    missionId: string;
  };
}

export async function POST(request: NextRequest, context: PostRouteContext) {
  const supabase = await createSupabaseRouteHandlerClient(); ///tasks/[taskId]/route.ts]
  const { data: { user }, error: authError } = await supabase.auth.getUser(); ///tasks/[taskId]/route.ts]

  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 }); ///tasks/[taskId]/route.ts]
  }

  const missionId = context.params.missionId;
  if (!missionId) {
    return NextResponse.json({ error: 'Mission ID is required' }, { status: 400 });
  }

  let validatedData;
  try {
    const body = await request.json();
    validatedData = createResourceSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input for resource.', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Invalid request body for resource.' }, { status: 400 });
  }

  try {
    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
    });

    if (!mission) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }

    if (mission.ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden: Only the mission owner can add resources' }, { status: 403 });
    }

    const newResource = await prisma.missionResource.create({
      data: {
        title: validatedData.title,
        url: validatedData.url,
        description: validatedData.description,
        emoji: validatedData.emoji,
        missionId: missionId,
        userId: user.id, // User who added the resource
      },
      include: {
        user: { select: { id: true, username: true, emoji: true } }
      }
    });

    return NextResponse.json(newResource, { status: 201 });
  } catch (error) {
    console.error(`Error creating resource for mission ${missionId}:`, error);
    return NextResponse.json({ error: 'Failed to create resource.' }, { status: 500 });
  }
}