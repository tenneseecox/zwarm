// src/app/api/missions/[id]/route.ts

import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

// --- GET Handler: Fetch a single Mission by ID ---
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Mission ID is required.' }, { status: 400 });
  }

  try {
    const mission = await prisma.mission.findUnique({
      where: { id },
      include: {
        owner: { // Include details about the mission owner
          select: {
            id: true,
            username: true,
            emoji: true,
            // avatarUrl: true, // if you add it later
          },
        },
        // You can include other relations here later, like tasks, participants, etc.
      },
    });

    if (!mission) {
      return NextResponse.json({ error: 'Mission not found.' }, { status: 404 });
    }

    return NextResponse.json(mission, { status: 200 });
  } catch (error) {
    console.error(`Error fetching mission ${id}:`, error);
    // Could be a Prisma error or other unexpected error
    type PrismaError = { code?: string; message?: string };
    if (
      typeof error === 'object' &&
      error !== null &&
      (
        ('code' in error && (error as PrismaError).code === 'P2023') ||
        ('message' in error && typeof (error as PrismaError).message === 'string' && (error as PrismaError).message!.includes('Malformed ObjectID'))
      )
    ) {
      return NextResponse.json({ error: 'Invalid Mission ID format.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to fetch mission.' }, { status: 500 });
  }
}

// Later, you can add PUT (update) and DELETE handlers in this same file.
// export async function PUT(request: NextRequest, { params }: RouteParams) { /* ... */ }
// export async function DELETE(request: NextRequest, { params }: RouteParams) { /* ... */ }