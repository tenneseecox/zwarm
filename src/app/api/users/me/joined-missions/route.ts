// src/app/api/users/me/joined-missions/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createSupabaseRouteHandlerClient } from '@/utils/supabase/route-handler-client'; // Adjust path
import type { Mission as MissionCardType } from '@/components/MissionCard'; // For type reference
import { formatTimeAgo } from '@/utils/time-helpers'; // Adjust path

// Define the type for the mission data included in the MissionParticipant query
interface PrismaJoinedMission {
  id: string;
  title: string;
  description: string;
  emoji: string | null;
  tags: string[]; // Assuming tags is a string array
  status: string; // Assuming status is a string
  createdAt: Date; // Prisma returns Dates
  _count: {
    participants: number;
  };
  owner: { // Included owner details
    id: string;
    username: string | null;
    emoji: string | null;
  } | null; // Owner might be null if the relation is optional or owner is deleted
  // Add other included fields if any
}

// Helper to transform Prisma mission to MissionCardType
const transformMissionForCard = (mission: PrismaJoinedMission | null): MissionCardType => {
    // Ensure mission object is not null or undefined if coming from a nested relation
    if (!mission) {
      // Return a default/empty MissionCardType for null missions
      console.warn("Attempted to transform a null mission.");
      return {
        id: '', // Use a placeholder or handle this case appropriately on the client
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
  const supabase = await createSupabaseRouteHandlerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const participations = await prisma.missionParticipant.findMany({
      where: { userId: user.id },
      orderBy: { joinedAt: 'desc' },
      include: {
        mission: { // Include the actual mission details
          include: {
            _count: {
              select: { participants: true },
            },
            owner: { // Include owner summary
                select: { username: true, emoji: true, id: true }
            }
            // Ensure all fields needed by transformMissionForCard are included here
            // e.g., title, description, emoji, tags, createdAt, status are implicitly included from the base Mission model
          },
        },
      },
    });

    // Map over participations and transform the nested mission object
    const joinedMissions = participations.map(p => transformMissionForCard(p.mission));
    
    // Filter out any potential null/empty results from transformMissionForCard if a participation pointed to a non-existent mission
    return NextResponse.json(joinedMissions.filter(mission => mission.id !== ''), { status: 200 });

  } catch (error) {
    console.error("Error fetching joined missions for user:", user.id, error);
    return NextResponse.json({ error: 'Failed to fetch joined missions.' }, { status: 500 });
  }
}