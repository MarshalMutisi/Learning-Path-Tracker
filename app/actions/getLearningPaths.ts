// File: app/actions/getLearningPaths.ts
'use server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

async function getLearningPaths() {
  const { userId } = await auth();
  console.log('Clerk userId:', userId);
  
  if (!userId) {
    console.log('No userId from Clerk');
    return [];
  }

  try {
    // Get the user's internal ID from Clerk ID
    let user = await db.user.findUnique({
      where: { clerkUserId: userId }
    });

    console.log('User from DB:', user);

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
        console.log('Created new user:', user);
      } else {
        console.log('Could not get user details from Clerk');
        return [];
      }
    }

    console.log('Querying learning paths for userId:', user.clerkUserId);

    const learningPaths = await db.learningPath.findMany({
      where: { userId: user.clerkUserId },
      include: {
        modules: {
          include: {
            learningItems: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    console.log('Found learning paths:', learningPaths);

    return learningPaths;
  } catch (error) {
    console.error('Error fetching learning paths:', error);
    return [];
  }
}

export default getLearningPaths;