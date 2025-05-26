// src/app/api/missions/route.ts

import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma'; // Your Prisma client instance
import { cookies } from 'next/headers'; // To manage cookies for Supabase server client
import { createServerClient, type CookieOptions } from '@supabase/ssr'; // Supabase server client
import { z } from 'zod'; // For validat

// Helper to create Supabase server client for Route Handlers
// (You might already have this in a central lib/supabase/server.ts)
const createSupabaseRouteHandlerClient = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
};

// Zod schema for mission creation input validation
const createMissionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long.").max(100),
  description: z.string().min(10, "Description must be at least 10 characters long.").max(5000),
  emoji: z.string().optional(), // Assuming emoji is optional for now
  // status will default to OPEN as per Prisma schema
});

// --- POST Handler: Create a new Mission ---
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseRouteHandlerClient();

  // 1. Check for authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  // 2. Parse and validate request body
  let missionData;
  try {
    const body = await request.json();
    missionData = createMissionSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input.', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  // 3. Create the mission in the database
  try {
    const newMission = await prisma.mission.create({
      data: {
        title: missionData.title,
        description: missionData.description,
        emoji: missionData.emoji,
        ownerId: user.id, // Link to the authenticated user
        // status defaults to OPEN as per your Prisma schema
      },
    });
    return NextResponse.json(newMission, { status: 201 }); // 201 Created
  } catch (error) {
    console.error("Error creating mission:", error);
    return NextResponse.json({ error: 'Failed to create mission.' }, { status: 500 });
  }
}

// --- GET Handler: Fetch all Missions ---
export async function GET() {
  try {
    const missions = await prisma.mission.findMany({
      orderBy: {
        createdAt: 'desc', // Show newest first
      },
      include: { // Optionally include owner details
        owner: {
          select: {
            id: true,
            username: true,
            emoji: true, // Or avatarUrl if you add that to User
          },
        },
      },
    });
    return NextResponse.json(missions, { status: 200 });
  } catch (error) {
    console.error("Error fetching missions:", error);
    return NextResponse.json({ error: 'Failed to fetch missions.' }, { status: 500 });
  }
}