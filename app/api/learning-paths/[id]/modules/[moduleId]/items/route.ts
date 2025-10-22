// File: app/api/learning-paths/[id]/modules/[moduleId]/items/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server'; // Import currentUser
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  try {
    // Await the params before using them
    const { id, moduleId } = await params;
    
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

    // Verify the module belongs to a learning path owned by the user
    const moduleRecord = await db.module.findFirst({
      where: {
        id: moduleId, // Use the awaited moduleId
        learningPath: {
          id, // Use the awaited id
          userId: user.clerkUserId,
        },
      }
    });

    if (!moduleRecord) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    const { title, url, type, order } = await request.json();

    const learningItem = await db.learningItem.create({
      data: {
        title,
        url,
        type,
        order,
        moduleId: moduleId, // Use the awaited moduleId
      },
    });

    return NextResponse.json(learningItem, { status: 201 });
  } catch (error) {
    console.error('Error creating learning item:', error);
    return NextResponse.json(
      { error: 'Failed to create learning item' },
      { status: 500 }
    );
  }
}