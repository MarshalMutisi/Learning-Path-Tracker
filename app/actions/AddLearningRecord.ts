// File: app/actions/addLearningRecord.ts
'use server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

async function addLearningRecord(formData: FormData) {
  // Extract form data
  const content = formData.get('content') as string;
  const progress = parseFloat(formData.get('progress') as string);
  const date = new Date(formData.get('date') as string);
  const learningItemId = formData.get('learningItemId') as string;

  // Validate inputs
  if (!content || isNaN(progress) || !date || !learningItemId) {
    return { error: 'Missing required fields' };
  }

  // Get authenticated user
  const { userId } = await auth();
  if (!userId) {
    return { error: 'Authentication required' };
  }

  try {
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
        return { error: 'User not found' };
      }
    }

    // Verify learning item exists and belongs to user
    const learningItem = await db.learningItem.findUnique({
      where: { id: learningItemId },
      include: {
        module: {
          include: {
            learningPath: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });

    if (!learningItem) {
      return { error: 'Learning item not found' };
    }

    // Check if the learning path belongs to the current user
    if (learningItem.module.learningPath.user.clerkUserId !== userId) {
      return { error: 'Access denied' };
    }

    // Create or update note
    const existingNote = await db.note.findFirst({
      where: {
        learningItemId,
        createdAt: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(23, 59, 59, 999))
        }
      }
    });

    if (existingNote) {
      await db.note.update({
        where: { id: existingNote.id },
        data: { content }
      });
    } else {
      await db.note.create({
        data: {
          content,
          learningItemId,
          createdAt: date
        }
      });
    }

    // Update learning item progress and completedAt if fully completed
    const updateData: any = {
      progress,
      isComplete: progress >= 100
    };
    
    // Set completedAt when item is fully completed
    if (progress >= 100 && !learningItem.completedAt) {
      updateData.completedAt = new Date();
    }
    
    await db.learningItem.update({
      where: { id: learningItemId },
      data: updateData
    });

    // Recalculate module progress
    const moduleItems = await db.learningItem.findMany({
      where: { moduleId: learningItem.moduleId }
    });
    const moduleProgress = moduleItems.length > 0 
      ? moduleItems.reduce((sum, item) => sum + item.progress, 0) / moduleItems.length 
      : 0;
    
    await db.module.update({
      where: { id: learningItem.moduleId },
      data: { progress: moduleProgress }
    });

    // Recalculate learning path progress
    const pathModules = await db.module.findMany({
      where: { learningPathId: learningItem.module.learningPathId }
    });
    const pathProgress = pathModules.length > 0
      ? pathModules.reduce((sum, module) => sum + module.progress, 0) / pathModules.length
      : 0;
    
    await db.learningPath.update({
      where: { id: learningItem.module.learningPathId },
      data: { progress: pathProgress }
    });

    // Revalidate the home page to show updated data
    revalidatePath('/');
    
    return { success: true };
  } catch (error) {
    console.error('Error adding learning record:', error);
    return { error: 'Failed to add learning record' };
  }
}

export default addLearningRecord;