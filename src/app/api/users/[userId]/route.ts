// src/app/api/users/[userId]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma'; //
import { formatTimeAgo } from '@/utils/time-helpers'; //

interface RouteContext {
  params: {
    userId: string;
  };
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { userId } = context.params;

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: false, // Explicitly exclude email for public profile
        emoji: true,
        bio: true,
        skills: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const ownedMissions = await prisma.mission.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        emoji: true,
        status: true,
        createdAt: true,
        tags: true,
        _count: {
          select: { participants: true },
        },
      },
    });

    const participations = await prisma.missionParticipant.findMany({
      where: { userId: userId },
      orderBy: { joinedAt: 'desc' },
      include: {
        mission: {
          select: {
            id: true,
            title: true,
            emoji: true,
            status: true,
            createdAt: true,
            tags: true,
            _count: {
              select: { participants: true },
            },
          },
        },
      },
    });

    const ownedMissionsData = ownedMissions.map(m => ({
      id: m.id,
      title: m.title,
      description: '', // Add description field if available in your schema
      emoji: m.emoji || '❓',
      tags: m.tags || [],
      contributors: m._count?.participants ?? 0,
      timeAgo: formatTimeAgo(m.createdAt),
      status: m.status,
    }));

    const joinedMissionsData = participations.map(p => ({
      id: p.mission.id,
      title: p.mission.title,
      description: '', // Add description field if available in your schema
      emoji: p.mission.emoji || '❓',
      tags: p.mission.tags || [],
      contributors: p.mission._count?.participants ?? 0,
      timeAgo: formatTimeAgo(p.mission.createdAt),
      status: p.mission.status,
    }));

    return NextResponse.json({
      user,
      ownedMissions: ownedMissionsData,
      joinedMissions: joinedMissionsData,
    }, { status: 200 });

  } catch (error) {
    console.error(`Error fetching profile for user ${userId}:`, error);
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
  }
}