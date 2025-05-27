// src/app/api/users/me/owned-missions/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createSupabaseRouteHandlerClient } from '@/utils/supabase/route-handler-client'; // Adjust path
import type { Mission as MissionCardType } from '@/components/MissionCard'; // For type reference if transforming here
import { formatTimeAgo } from '@/utils/time-helpers'; // Adjust path

// Define the type for the mission data returned by the Prisma query
// This should match the fields selected in prisma.mission.findMany
interface PrismaOwnedMission {
  id: string;
  title: string;
  description: string;
  emoji: string | null;
  tags: string[]; // Assuming tags is a string array in your schema
  status: string; // Assuming status is a string (enum treated as string by default)
  createdAt: Date; // Prisma returns Dates for DateTime fields
  _count: {
    participants: number;
  };
  owner: {
    id: string;
    username: string | null;
    emoji: string | null;
  } | null;
  // Add other fields here if your query selects them
}

// Helper to transform Prisma mission to MissionCardType
// If you prefer to do transformation on the client (page), remove this and return raw data.
const transformMissionForCard = (mission: PrismaOwnedMission): MissionCardType => {
  if (!mission) {
    console.warn("Attempted to transform a null mission.");
    return {
      id: '',
      title: 'Deleted Mission',
      description: '',
      emoji: '❓',
      tags: [],
      contributors: 0,
      timeAgo: 'N/A',
      status: 'ARCHIVED',
    };
  }
  return {
    id: mission.id,
    title: mission.title,
    description: mission.description,
    emoji: mission.emoji || '❓',
    tags: mission.tags || [],
    contributors: mission._count?.participants ?? 0,
    timeAgo: formatTimeAgo(mission.createdAt),
    status: mission.status,
  };
};

export async function GET() {
  try {
    const supabase = await createSupabaseRouteHandlerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('Auth error in owned missions:', authError);
      return NextResponse.json({ error: 'Authentication error' }, { status: 401 });
    }

    if (!user) {
      console.error('No user found in owned missions');
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const ownedMissions = await prisma.mission.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { participants: true },
        },
        owner: {
          select: {
            id: true,
            username: true,
            emoji: true,
          },
        },
      },
    });

    const transformedMissions = ownedMissions
      .filter((mission): mission is NonNullable<typeof mission> => mission !== null)
      .map(transformMissionForCard);

    return NextResponse.json(transformedMissions, { status: 200 });

  } catch (error) {
    console.error("Error fetching owned missions:", error);
    return NextResponse.json(
      { error: 'Failed to fetch owned missions' }, 
      { status: 500 }
    );
  }
}