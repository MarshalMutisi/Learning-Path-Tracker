// File: app/actions/getLearningRecords.ts
'use server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

interface LearningRecord {
  date: string;
  progress: number;
}

async function getLearningRecords(): Promise<LearningRecord[]> {
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

    // Fetch all notes for the user, grouped by date
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
      include: {
        learningItem: true,
      },
    });

    // Group notes by date and calculate average progress per day
    const recordsByDate: Record<string, { totalProgress: number; count: number }> = {};
    
    notes.forEach(note => {
      const date = new Date(note.createdAt).toISOString().split('T')[0];
      if (!recordsByDate[date]) {
        recordsByDate[date] = { totalProgress: 0, count: 0 };
      }
      recordsByDate[date].totalProgress += note.learningItem.progress;
      recordsByDate[date].count += 1;
    });

    // Calculate average progress per day
    const learningRecords: LearningRecord[] = Object.entries(recordsByDate).map(([date, data]) => ({
      date,
      progress: data.count > 0 ? Math.round(data.totalProgress / data.count) : 0,
    }));

    // Sort by date and take the last 7 days
    return learningRecords
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7);
  } catch (error) {
    console.error('Error fetching learning records:', error);
    return [];
  }
}

export default getLearningRecords;