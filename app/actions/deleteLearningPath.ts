// File: app/actions/deleteLearningPath.ts
'use server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export default async function deleteLearningPath(learningPathId: string) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    // Get the user's internal ID from Clerk ID (same pattern as getLearningPaths)
    let user = await db.user.findUnique({
      where: { clerkUserId: userId }
    });

    // If user doesn't exist, create them (same pattern as getLearningPaths)
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
        throw new Error('User not found');
      }
    }

    console.log('User found/created:', user.id);
    console.log('Looking for learning path with ID:', learningPathId);

    // Check if the learning path exists and belongs to the user
    const learningPath = await db.learningPath.findFirst({
      where: {
        id: learningPathId,
        userId: user.clerkUserId  // Use clerkUserId like in getLearningPaths
      }
    });

    console.log('Learning path found:', learningPath);

    if (!learningPath) {
      throw new Error('Learning path not found or access denied');
    }

    // Delete the learning path (this will also delete related modules and items due to cascading deletes)
    await db.learningPath.delete({
      where: { id: learningPathId }
    });

    console.log('Learning path deleted successfully');

    return { success: true };
  } catch (error) {
    console.error('Error deleting learning path:', error);
    throw new Error('Failed to delete learning path');
  }
}