// File: app/api/learning-items/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function PATCH(
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

    const { isComplete } = await request.json();

    // Verify the learning item belongs to a module owned by the user
    const learningItem = await db.learningItem.findFirst({
      where: {
        id, // Use the awaited id
        module: {
          learningPath: {
            userId: user.clerkUserId,
          },
        },
      },
      include: {
        module: {
          include: {
            learningPath: true,
          },
        },
      },
    });

    if (!learningItem) {
      return NextResponse.json({ error: 'Learning item not found' }, { status: 404 });
    }

    // Update the learning item
    const updatedItem = await db.learningItem.update({
      where: { id }, // Use the awaited id
      data: {
        isComplete,
        completedAt: isComplete ? new Date() : null,
      },
    });

    // Recalculate module progress
    const moduleItems = await db.learningItem.findMany({
      where: { moduleId: learningItem.moduleId },
    });
    const completedItems = moduleItems.filter(item => item.isComplete);
    const moduleProgress = moduleItems.length > 0 
      ? (completedItems.length / moduleItems.length) * 100 
      : 0;
    
    await db.module.update({
      where: { id: learningItem.moduleId },
      data: { progress: moduleProgress },
    });

    // Recalculate learning path progress
    const pathModules = await db.module.findMany({
      where: { learningPathId: learningItem.module.learningPathId },
    });
    const pathProgress = pathModules.length > 0
      ? pathModules.reduce((sum, module) => sum + module.progress, 0) / pathModules.length
      : 0;
    
    await db.learningPath.update({
      where: { id: learningItem.module.learningPathId },
      data: { progress: pathProgress },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating learning item:', error);
    return NextResponse.json(
      { error: 'Failed to update learning item' },
      { status: 500 }
    );
  }
}