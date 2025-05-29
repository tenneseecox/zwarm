// src/app/api/users/me/settings/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma'; //
import { createSupabaseRouteHandlerClient } from '@/utils/supabase/route-handler-client'; ///tasks/[taskId]/route.ts]
import { z } from 'zod'; //

const updateSettingsSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters.")
    .max(25, "Username can be at most 25 characters.")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores.")
    .optional(),
  emoji: z.string().optional(), // Add more specific emoji validation if needed
  bio: z.string()
    .max(500, "Bio must be at most 500 characters.")
    .optional(),
  skills: z.array(z.string())
    .max(10, "You can add up to 10 skills.")
    .optional(),
});

export async function PUT(request: NextRequest) {
  const supabase = await createSupabaseRouteHandlerClient(); ///tasks/[taskId]/route.ts]
  const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser(); ///tasks/[taskId]/route.ts]

  if (authError || !currentUser) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 }); ///tasks/[taskId]/route.ts]
  }

  let validatedData;
  try {
    const body = await request.json();
    validatedData = updateSettingsSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input.', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  // Prevent empty updates
  if (Object.keys(validatedData).length === 0) {
    return NextResponse.json({ error: 'No update data provided.' }, { status: 400 });
  }

  try {
    // If username is being updated, check for uniqueness against other users
    if (validatedData.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username: validatedData.username },
      });
      if (existingUser && existingUser.id !== currentUser.id) {
        return NextResponse.json({ error: 'Username is already taken.' }, { status: 409 }); // 409 Conflict
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        ...(validatedData.username && { username: validatedData.username }),
        ...(validatedData.emoji && { emoji: validatedData.emoji }),
        ...(validatedData.bio !== undefined && { bio: validatedData.bio }),
        ...(validatedData.skills !== undefined && { skills: validatedData.skills }),
        // email and password changes would typically be handled through Supabase Auth methods directly
      },
      select: { // Return only public safe fields
        id: true,
        username: true,
        emoji: true,
        bio: true,
        skills: true,
        updatedAt: true
      }
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Error updating user settings:', error);
    return NextResponse.json({ error: 'Failed to update user settings.' }, { status: 500 });
  }
}