// File: app/dashboard/analysis/page.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface LearningPath {
  id: string;
  title: string;
  progress: number;
  completedItems: number;
  totalItems: number;
  createdAt: string;
}

interface LearningAnalytics {
  bestLearningPaths: LearningPath[];
  worstLearningPaths: LearningPath[];
  mostProductiveDays: string[];
  leastProductiveDays: string[];
  learningTypeDistribution: Record<string, number>;
  completionTrends: { date: string; completed: number }[];
  averageCompletionTime: number;
  totalLearningTime: number;
  totalLearningPaths: number;
  totalModules: number;
  totalItems: number;
  completedItems: number;
}

export default function LearningAnalysisPage() {
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/learning-paths/analysis');
        if (!response.ok) {
          throw new Error('Failed to fetch learning analytics');
        }
        const data = await response.json();
        setAnalytics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading analytics...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (!analytics) return <div className="p-8 text-center">No analytics data available</div>;

  return (
    <main className='bg-gray-100 text-gray-800 font-sans min-h-screen'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
        <div className="mb-6">
          {/* Fixed: Changed from "/dashboard" to "/" */}
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Learning Analytics</h1>
          <p className="text-gray-600 mt-2">
            Insights into your learning patterns and progress
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Learning Paths</h3>
            <p className="text-3xl font-bold text-blue-600">{analytics.totalLearningPaths}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Completion Rate</h3>
            <p className="text-3xl font-bold text-green-600">
              {analytics.totalItems > 0 ? Math.round((analytics.completedItems / analytics.totalItems) * 100) : 0}%
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Total Learning Time</h3>
            <p className="text-3xl font-bold text-purple-600">{analytics.totalLearningTime} hours</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Avg. Time per Item</h3>
            <p className="text-3xl font-bold text-yellow-600">{analytics.averageCompletionTime} hours</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Best Learning Paths */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold text-blue-600">Best Learning Paths</h2>
            </div>
            <div className="p-4">
              {analytics.bestLearningPaths.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No high-performing paths yet</p>
              ) : (
                <div className="space-y-4">
                  {analytics.bestLearningPaths.map((path) => (
                    <div key={path.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex justify-between items-start">
                        <Link 
                          href={`/learning-path/${path.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {path.title}
                        </Link>
                        <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                          {path.progress}%
                        </span>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <span>{path.completedItems} of {path.totalItems} items completed</span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${path.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Worst Learning Paths */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold text-blue-600">Learning Paths Needing Attention</h2>
            </div>
            <div className="p-4">
              {analytics.worstLearningPaths.length === 0 ? (
                <p className="text-gray-500 text-center py-4">All paths are progressing well!</p>
              ) : (
                <div className="space-y-4">
                  {analytics.worstLearningPaths.map((path) => (
                    <div key={path.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex justify-between items-start">
                        <Link 
                          href={`/learning-path/${path.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {path.title}
                        </Link>
                        <span className="text-sm font-medium text-red-600 bg-red-100 px-2 py-1 rounded">
                          {path.progress}%
                        </span>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <span>{path.completedItems} of {path.totalItems} items completed</span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full" 
                          style={{ width: `${path.progress}%` }}
                        ></div>
                      </div>
                      <Link 
                        href={`/learning-path/${path.id}`}
                        className="mt-3 inline-block text-sm text-blue-600 hover:text-blue-800"
                      >
                        Focus on this path →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Learning Type Distribution */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold text-blue-600">Learning Type Distribution</h2>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {Object.entries(analytics.learningTypeDistribution).map(([type, count]) => (
                  <div key={type} className="flex items-center">
                    <div className="w-3/12 text-sm font-medium text-gray-700 capitalize">{type}</div>
                    <div className="w-7/12">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ 
                            width: `${(count / Object.values(analytics.learningTypeDistribution).reduce((a, b) => a + b, 0)) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-2/12 text-right text-sm text-gray-500">{count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Productive Days */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold text-blue-600">Productive Days Analysis</h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-green-600 mb-2">Most Productive Days</h3>
                  <ul className="space-y-1">
                    {analytics.mostProductiveDays.map((day, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-xs mr-2">
                          {index + 1}
                        </span>
                        <span>{day}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-red-600 mb-2">Least Productive Days</h3>
                  <ul className="space-y-1">
                    {analytics.leastProductiveDays.map((day, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-6 h-6 rounded-full bg-red-100 text-red-800 flex items-center justify-center text-xs mr-2">
                          {index + 1}
                        </span>
                        <span>{day}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <h3 className="font-medium text-gray-700 mb-2">Recommendation</h3>
                <p className="text-sm text-gray-600">
                  Schedule important learning activities on your most productive days ({analytics.mostProductiveDays.join(', ')}) 
                  for better retention and completion rates.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Completion Trends */}
        <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold text-blue-600">Completion Trends</h2>
          </div>
          <div className="p-4">
            <div className="h-64 flex items-end space-x-2">
              {analytics.completionTrends.map((trend, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                    style={{ height: `${(trend.completed / 10) * 100}%` }}
                  ></div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(trend.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold text-blue-600">Personalized Recommendations</h2>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {analytics.bestLearningPaths.length > 0 && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-800 mb-2">Leverage Your Strengths</h3>
                  <p className="text-green-700">
                    You're making excellent progress on "{analytics.bestLearningPaths[0].title}". 
                    Apply similar strategies to other learning paths.
                  </p>
                </div>
              )}
              
              {analytics.worstLearningPaths.length > 0 && (
                <div className="p-4 bg-red-50 rounded-lg">
                  <h3 className="font-medium text-red-800 mb-2">Focus Areas</h3>
                  <p className="text-red-700">
                    "{analytics.worstLearningPaths[0].title}" needs attention. 
                    Consider breaking it into smaller, manageable tasks.
                  </p>
                </div>
              )}
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Optimal Learning Schedule</h3>
                <p className="text-blue-700">
                  Based on your patterns, schedule challenging learning materials on {analytics.mostProductiveDays[0]} 
                  when you're most productive.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}