// File: app/actions/getRecentActivity.ts
'use server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

interface ActivityItem {
  id: string;
  title: string;
  type: string;
  progress: number;
  date: string;
  pathTitle: string;
}

async function getRecentActivity(): Promise<ActivityItem[]> {
  const { userId } = await auth();
  if (!userId) {
    return [];
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
        return [];
      }
    }

    // Fetch recent notes (learning records) with related learning items
    const notes = await db.note.findMany({
      where: {
        learningItem: {
          module: {
            learningPath: {
              userId: user.clerkUserId,
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10, // Limit to 10 most recent activities
      include: {
        learningItem: {
          include: {
            module: {
              include: {
                learningPath: true,
              },
            },
          },
        },
      },
    });

    // Transform notes to activity items
    const activities: ActivityItem[] = notes.map(note => ({
      id: note.id,
      title: note.content.substring(0, 50) + (note.content.length > 50 ? '...' : ''), // Truncate long content
      type: 'Note',
      progress: note.learningItem.progress,
      date: note.createdAt.toISOString(),
      pathTitle: note.learningItem.module.learningPath.title,
    }));

    return activities;
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
}

export default getRecentActivity;