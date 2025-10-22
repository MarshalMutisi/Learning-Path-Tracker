// File: app/api/learning-paths/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user's internal ID from Clerk ID
    let user = await db.user.findUnique({
      where: { clerkUserId: userId }
    });

    // If user doesn't exist, create them
    if (!user) {
      const clerkUser = await auth();
      if (clerkUser) {
        user = await db.user.create({
          data: {
            clerkUserId: userId,
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
            imageUrl: clerkUser.imageUrl,
          }
        });
      } else {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
    }

    // Await the params before accessing properties
    const { id } = await params;
    
    const learningPath = await db.learningPath.findFirst({
      where: {
        id: id,
        userId: user.clerkUserId,
      },
      include: {
        modules: {
          include: {
            learningItems: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!learningPath) {
      return NextResponse.json({ error: 'Learning path not found' }, { status: 404 });
    }

    return NextResponse.json(learningPath);
  } catch (error) {
    console.error('Error fetching learning path:', error);
    return NextResponse.json(
      { error: 'Failed to fetch learning path' },
      { status: 500 }
    );
  }
}