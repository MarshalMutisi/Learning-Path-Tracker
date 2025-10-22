// File: app/page.tsx
import AddLearningRecord from '@/components/AddLearningRecord';
import Guest from '@/components/Guest';
import LearningProgressChart from '@/components/LearningProgressChart';
import AverageProgress from '@/components/AverageProgress';
import RecentActivity from '@/components/RecentActivity';
import LearningPathsSection from '@/components/LearningPathsSection';
import { currentUser } from '@clerk/nextjs/server';
import getLearningPaths from '@/app/actions/getLearningPaths';
import getLearningRecords from '@/app/actions/getLearningRecords';
import getAverageProgress from '@/app/actions/getAverageProgress';
import getRecentActivity from '@/app/actions/getRecentActivity';
import Link from 'next/link';
import Image from 'next/image'; // Added import for Next.js Image component

export default async function HomePage() {
  // Removed: noStore();
  
  const user = await currentUser();
  if (!user) {
    return <Guest />;
  }

  // Fetch learning paths
  const learningPaths = await getLearningPaths();
  
  // Transform the learning paths to include moduleTitle and pathTitle in learning items
  const transformedLearningPaths = learningPaths.map(path => ({
    ...path,
    modules: path.modules.map(module => ({
      ...module,
      learningItems: module.learningItems.map(item => ({
        ...item,
        moduleTitle: module.title,
        pathTitle: path.title
      }))
    }))
  }));
  
  // Fetch learning records for the chart
  const learningRecords = await getLearningRecords();
  
  // Fetch average progress data
  const progressData = await getAverageProgress();
  
  // Fetch recent activity
  const recentActivity = await getRecentActivity();

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
    <main className='bg-gray-100 text-gray-800 font-sans min-h-screen'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 gap-8'>
        {/* Left Column */}
        <div className='space-y-6'>
          <div className='bg-white p-6 rounded-lg shadow-md flex flex-col sm:flex-row items-center sm:items-start gap-6'>
            {/* User Image */}
            <Image
              src={user.imageUrl || ''}
              alt={`${user.firstName || 'User'}'s profile`}
              width={96} // 24 * 4 (w-24 = 6rem = 96px)
              height={96} // 24 * 4 (h-24 = 6rem = 96px)
              className='w-24 h-24 rounded-full border border-gray-300 shadow-md'
            />

            {/* User Details */}
            <div className='flex-1'>
              <h2 className='text-2xl md:text-3xl font-bold text-blue-600 mb-2'>
                Welcome Back, {user.firstName || 'User'} 👋
              </h2>
              <p className='text-gray-600 mb-4'>
                Here&apos;s a quick overview of your learning progress.
                Track your learning paths and continue your educational journey!
              </p>
              <div className='space-y-2'>
                <p className='text-gray-600'>
                  <span className='font-semibold text-gray-800'>Joined:</span>{' '}
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
                <p className='text-gray-600'>
                  <span className='font-semibold text-gray-800'>
                    Last Active:
                  </span>{' '}
                  {user.lastActiveAt
                    ? new Date(user.lastActiveAt).toLocaleString()
                    : 'N/A'}
                </p>
                <div className='mt-3 p-3 bg-blue-50 rounded-md'>
                  <p className='text-sm text-blue-800'>
                    <span className='font-semibold'>Learning Stats:</span> {totalPaths} paths, {totalModules} modules, {totalItems} items
                  </p>
                  <div className='mt-2 w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-blue-600 h-2 rounded-full'
                      style={{ width: `${overallProgress}%` }}
                    ></div>
                  </div>
                  <p className='text-xs text-blue-800 mt-1'>
                    Overall Progress: {Math.round(overallProgress)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Add Learning Record Form */}
          <AddLearningRecord learningPaths={transformedLearningPaths || []} />
        </div>

        {/* Right Column */}
        <div className='space-y-6'>
          {/* Learning Paths Overview */}
          <LearningPathsSection />
          
          {/* Learning Analytics Card */}
          <div className='bg-white p-6 rounded-lg shadow-md'>
            <div className="flex justify-between items-center mb-4">
              <h3 className='text-xl font-semibold text-blue-600'>Learning Analytics</h3>
              <Link 
                href="/dashboard/analysis" 
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                View Details
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                  <span className="text-sm font-medium text-gray-700">{Math.round(overallProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${overallProgress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{totalPaths}</p>
                  <p className="text-xs text-gray-600">Paths</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{totalModules}</p>
                  <p className="text-xs text-gray-600">Modules</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{totalItems}</p>
                  <p className="text-xs text-gray-600">Items</p>
                </div>
              </div>
              
              <div className="text-center">
                <Link 
                  href="/dashboard/analysis" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                >
                  View Learning Analytics
                </Link>
              </div>
            </div>
          </div>
          
          {/* Learning Progress Overview */}
          <AverageProgress progressData={progressData} />
          
          {/* Recent Activity */}
          <RecentActivity activities={recentActivity} />
          
          {/* Learning Progress Chart */}
          <div className='bg-white p-6 rounded-lg shadow-md'>
            <h3 className='text-xl font-semibold mb-4 text-blue-600'>Learning Progress (Last 7 Days)</h3>
            {learningRecords.length > 0 ? (
              <div className="h-64">
                <LearningProgressChart records={learningRecords} />
              </div>
            ) : (
              <div className="text-center py-8">
                <p className='text-gray-500 italic'>No learning records yet. Start tracking your progress!</p>
              </div>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className='bg-white p-6 rounded-lg shadow-md'>
            <h3 className='text-xl font-semibold mb-4 text-blue-600'>Quick Actions</h3>
            <div className='grid grid-cols-2 gap-4'>
              <Link 
                href="/create-learning-path" 
                className='p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center'
              >
                <div className='text-blue-600 mb-2'>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <span className='text-sm font-medium text-gray-800'>New Learning Path</span>
              </Link>
              
              <Link 
                href="/dashboard/analysis" 
                className='p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center'
              >
                <div className='text-purple-600 mb-2'>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className='text-sm font-medium text-gray-800'>Learning Analytics</span>
              </Link>
              
              <Link 
                href="/learning-paths" 
                className='p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center'
              >
                <div className='text-green-600 mb-2'>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                </div>
                <span className='text-sm font-medium text-gray-800'>View All Paths</span>
              </Link>
              
              <Link 
                href="/add-learning-record" 
                className='p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors text-center'
              >
                <div className='text-yellow-600 mb-2'>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className='text-sm font-medium text-gray-800'>Add Record</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}