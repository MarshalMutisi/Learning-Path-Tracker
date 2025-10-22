// File: app/api/learning-paths/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server'; // Import currentUser
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
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

    const { title, description } = await request.json();

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Create the learning path
    const learningPath = await db.learningPath.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        userId: user.clerkUserId, // Use clerkUserId instead of id
      },
    });

    return NextResponse.json(learningPath, { status: 201 });
  } catch (error) {
    console.error('Error creating learning path:', error);
    return NextResponse.json(
      { error: 'Failed to create learning path' },
      { status: 500 }
    );
  }
}