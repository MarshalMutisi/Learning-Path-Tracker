// File: app/learning-paths/page.tsx
import { currentUser } from '@clerk/nextjs/server';
import getLearningPaths from '@/app/actions/getLearningPaths';
import { unstable_noStore as noStore } from 'next/cache';
import Link from 'next/link';
import CreateLearningPathButton from '@/components/CreateLearningPathButton';

export default async function AllLearningPathsPage() {
  noStore(); // This disables caching for this page
  
  const user = await currentUser();
  if (!user) {
    // You might want to redirect to sign-in or show a message
    return <div>Please sign in to view your learning paths.</div>;
  }

  // Fetch all learning paths
  const learningPaths = await getLearningPaths();
  
  // Calculate overall stats
  const totalPaths = learningPaths.length;
  const totalModules = learningPaths.reduce((sum, path) => sum + (path.modules?.length || 0), 0);
  const totalItems = learningPaths.reduce(
    (sum, path) => sum + (path.modules?.reduce((moduleSum, module) => moduleSum + (module.learningItems?.length || 0), 0) || 0),
    0
  );
  const overallProgress = totalPaths > 0
    ? learningPaths.reduce((sum, path) => sum + (path.progress || 0), 0) / totalPaths
    : 0;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Learning Paths</h1>
              <p className="mt-2 text-gray-600">
                Manage and track all your learning paths in one place.
              </p>
            </div>
            <CreateLearningPathButton />
          </div>
          
          {/* Stats Overview */}
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{totalPaths}</p>
                <p className="text-gray-600">Learning Paths</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{totalModules}</p>
                <p className="text-gray-600">Modules</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{totalItems}</p>
                <p className="text-gray-600">Learning Items</p>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                <span className="text-sm font-medium text-blue-600">{Math.round(overallProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Paths Grid */}
        {learningPaths.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningPaths.map((path) => (
              <Link key={path.id} href={`/learning-path/${path.id}`} className="block">
                <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{path.title}</h3>
                      <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {Math.round(path.progress || 0)}%
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {path.description || 'No description available'}
                    </p>
                    
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-500">Progress</span>
                        <span className="text-xs font-medium text-blue-600">{Math.round(path.progress || 0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${path.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{path.modules?.length || 0} modules</span>
                      <span>
                        {path.modules?.reduce((sum, module) => sum + (module.learningItems?.length || 0), 0) || 0} items
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 px-6 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors">
                    View Details →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No learning paths yet</h3>
            <p className="text-gray-600 mb-6">Create your first learning path to get started on your learning journey.</p>
            <CreateLearningPathButton />
          </div>
        )}
      </div>
    </div>
  );
}