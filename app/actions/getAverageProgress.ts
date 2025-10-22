// File: app/actions/getAverageProgress.ts
'use server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

async function getAverageProgress() {
  const { userId } = await auth();
  if (!userId) {
    return {
      averageProgress: 0,
      totalPaths: 0,
      completedPaths: 0,
      inProgressPaths: 0,
      notStartedPaths: 0,
    };
  }

  try {
    // Get the user's internal ID from Clerk ID
    let user = await db.user.findUnique({
      where: { clerkUserId: userId }
    });

    // If user doesn't exist, create them
    if (!user) {
      // Get the full user object using currentUser
      const clerkUser = await currentUser();
      if (clerkUser) {
        user = await db.user.create({
          data: {
            clerkUserId: userId,
            // Fixed: Use emailAddresses from the full user object
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
            imageUrl: clerkUser.imageUrl,
          }
        });
      } else {
        return {
          averageProgress: 0,
          totalPaths: 0,
          completedPaths: 0,
          inProgressPaths: 0,
          notStartedPaths: 0,
        };
      }
    }

    // Fetch all learning paths for the user
    const learningPaths = await db.learningPath.findMany({
      where: { userId: user.clerkUserId },
      include: {
        modules: {
          include: {
            learningItems: true
          }
        }
      }
    });

    const totalPaths = learningPaths.length;
    
    if (totalPaths === 0) {
      return {
        averageProgress: 0,
        totalPaths: 0,
        completedPaths: 0,
        inProgressPaths: 0,
        notStartedPaths: 0,
      };
    }

    // Calculate total progress
    const totalProgress = learningPaths.reduce((sum, path) => sum + path.progress, 0);
    const averageProgress = totalProgress / totalPaths;

    // Count paths by status
    const completedPaths = learningPaths.filter(path => path.progress === 100).length;
    const inProgressPaths = learningPaths.filter(path => path.progress > 0 && path.progress < 100).length;
    const notStartedPaths = learningPaths.filter(path => path.progress === 0).length;

    return {
      averageProgress: Math.round(averageProgress * 100) / 100, // Round to 2 decimal places
      totalPaths,
      completedPaths,
      inProgressPaths,
      notStartedPaths,
    };
  } catch (error) {
    console.error('Error calculating average progress:', error);
    return {
      averageProgress: 0,
      totalPaths: 0,
      completedPaths: 0,
      inProgressPaths: 0,
      notStartedPaths: 0,
    };
  }
}

export default getAverageProgress;