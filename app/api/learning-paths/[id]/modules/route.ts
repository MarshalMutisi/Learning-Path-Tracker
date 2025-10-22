// File: app/api/learning-paths/[id]/modules/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server'; // Import currentUser
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params before using them
    const { id } = await params;
    
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
      // Use currentUser() to get detailed user information
      const clerkUser = await currentUser();
      if (clerkUser) {
        // Safely access email with multiple fallback options
        let email = '';
        if (clerkUser.emailAddresses && clerkUser.emailAddresses.length > 0) {
          email = clerkUser.emailAddresses[0].emailAddress;
        } else if (clerkUser.primaryEmailAddress) {
          email = clerkUser.primaryEmailAddress.emailAddress;
        }
        
        user = await db.user.create({
          data: {
            clerkUserId: userId,
            email: email,
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
            imageUrl: clerkUser.imageUrl || '',
          }
        });
      } else {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
    }

    // Verify the learning path belongs to the user
    const learningPath = await db.learningPath.findFirst({
      where: {
        id, // Use the awaited id
        userId: user.clerkUserId,
      }
    });

    if (!learningPath) {
      return NextResponse.json({ error: 'Learning path not found' }, { status: 404 });
    }

    const { title, description, order } = await request.json();

    const newModule = await db.module.create({
      data: {
        title,
        description,
        order,
        learningPathId: id, // Use the awaited id
      },
    });

    return NextResponse.json(newModule, { status: 201 });
  } catch (error) {
    console.error('Error creating module:', error);
    return NextResponse.json(
      { error: 'Failed to create module' },
      { status: 500 }
    );
  }
}