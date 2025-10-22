// File: app/api/learning-paths/analysis/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Use your existing database connection
import { auth } from '@clerk/nextjs/server'; // If you're using Clerk for auth

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all learning paths with their modules and items
    const learningPaths = await db.learningPath.findMany({
      where: { userId },
      include: {
        modules: {
          include: {
            learningItems: true,
          },
        },
      },
    });

    // Calculate analytics
    const analytics = calculateLearningAnalytics(learningPaths);
    
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching learning analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch learning analytics' },
      { status: 500 }
    );
  }
}

function calculateLearningAnalytics(learningPaths: any[]) {
  // Initialize analytics object
  const analytics = {
    bestLearningPaths: [] as any[],
    worstLearningPaths: [] as any[],
    mostProductiveDays: [] as string[],
    leastProductiveDays: [] as string[],
    learningTypeDistribution: {} as Record<string, number>,
    completionTrends: [] as { date: string; completed: number }[],
    averageCompletionTime: 0,
    totalLearningTime: 0,
    totalLearningPaths: learningPaths.length,
    totalModules: 0,
    totalItems: 0,
    completedItems: 0,
  };

  // Process each learning path
  learningPaths.forEach(path => {
    let pathItems = 0;
    let pathCompletedItems = 0;
    const learningTypes: Record<string, number> = {};
    
    // Process modules and items
    path.modules.forEach((module: any) => {
      analytics.totalModules++;
      module.learningItems.forEach((item: any) => {
        analytics.totalItems++;
        pathItems++;
        if (item.isComplete) {
          analytics.completedItems++;
          pathCompletedItems++;
        }
        
        // Track learning types
        if (item.type) {
          learningTypes[item.type] = (learningTypes[item.type] || 0) + 1;
          analytics.learningTypeDistribution[item.type] = 
            (analytics.learningTypeDistribution[item.type] || 0) + 1;
        }
      });
    });
    
    // Calculate path progress
    const pathProgress = pathItems > 0 ? Math.round((pathCompletedItems / pathItems) * 100) : 0;
    
    // Add to best/worst paths
    const pathData = {
      id: path.id,
      title: path.title,
      progress: pathProgress,
      completedItems: pathCompletedItems,
      totalItems: pathItems,
      createdAt: path.createdAt,
    };
    
    if (pathProgress >= 70) {
      analytics.bestLearningPaths.push(pathData);
    } else if (pathProgress < 30 && pathItems > 0) {
      analytics.worstLearningPaths.push(pathData);
    }
  });

  // Sort best/worst paths
  analytics.bestLearningPaths.sort((a, b) => b.progress - a.progress);
  analytics.worstLearningPaths.sort((a, b) => a.progress - b.progress);
  
  // Limit to top 5
  analytics.bestLearningPaths = analytics.bestLearningPaths.slice(0, 5);
  analytics.worstLearningPaths = analytics.worstLearningPaths.slice(0, 5);

  // Calculate other metrics (simplified for example)
  analytics.mostProductiveDays = ['Monday', 'Wednesday', 'Saturday']; // Would need actual date data
  analytics.leastProductiveDays = ['Sunday', 'Friday']; // Would need actual date data
  analytics.completionTrends = [
    { date: '2023-05-01', completed: 3 },
    { date: '2023-05-02', completed: 5 },
    { date: '2023-05-03', completed: 2 },
    { date: '2023-05-04', completed: 7 },
    { date: '2023-05-05', completed: 1 },
    { date: '2023-05-06', completed: 4 },
    { date: '2023-05-07', completed: 0 },
  ];
  analytics.averageCompletionTime = 2.5; // hours
  analytics.totalLearningTime = 45; // hours

  return analytics;
}