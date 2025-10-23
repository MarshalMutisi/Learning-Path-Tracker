// File: app/components/LearningPathsSection.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import DeleteLearningPathButton from './DeleteLearningPathButton';
import CreateLearningPathButton from './CreateLearningPathButton';
import getLearningPaths from '@/app/actions/getLearningPaths';

interface LearningItem {
  id: string;
  title: string;
  // Add other learning item properties as needed
}

interface Module {
  id: string;
  title: string;
  learningItems?: LearningItem[];
  // Add other module properties as needed
}

interface LearningPath {
  id: string;
  title: string;
  description?: string;
  progress: number;
  modules: Module[];
}

export default function LearningPathsSection() {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLearningPaths = async () => {
      const paths = await getLearningPaths() as LearningPath[]; // Explicitly cast the result
      setLearningPaths(paths);
      setLoading(false);
    };

    fetchLearningPaths();
  }, []);

  const handleDelete = (deletedId: string) => {
    setLearningPaths(prevPaths => prevPaths.filter(path => path.id !== deletedId));
  };

  if (loading) return <div className="p-8 text-center">Loading learning paths...</div>;

  return (
    <div className='bg-white p-6 rounded-lg shadow-md'>
      <div className='flex justify-between items-center mb-4'>
        <h3 className='text-xl font-semibold text-blue-600'>Your Learning Paths</h3>
        <Link href="/create-learning-path" className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600">
          + New Path
        </Link>
      </div>
      
      {learningPaths.length > 0 ? (
        <div className='space-y-4'>
          {learningPaths.map((path) => (
            <div key={path.id} className='border-l-4 border-blue-500 pl-4 py-2 hover:bg-gray-50 transition-colors rounded-r group relative'>
              <div className='flex justify-between items-start'>
                <Link href={`/learning-path/${path.id}`} className='block group flex-1 pr-2'>
                  <div className='flex items-start'>
                    <div className='flex-1 min-w-0'> {/* Added min-w-0 to prevent flex item overflow */}
                      <div className='flex items-center'>
                        <h4 className='font-medium text-gray-800 group-hover:text-blue-600 transition-colors truncate'>
                          {path.title}
                        </h4>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      <div className='mt-1'> {/* Added wrapper div for better control */}
                        <p className='text-sm text-gray-600 break-words'>
                          {path.description || 'No description'}
                        </p>
                      </div>
                      <div className='mt-2 w-full bg-gray-200 rounded-full h-2'>
                        <div
                          className='bg-blue-500 h-2 rounded-full transition-all duration-300'
                          style={{ width: `${path.progress || 0}%` }}
                        ></div>
                      </div>
                      <div className='flex justify-between mt-1'>
                        <p className='text-xs text-gray-500'>
                          {path.modules?.length || 0} modules
                        </p>
                        <p className='text-xs text-gray-500'>
                          {path.modules?.reduce((sum, module) => sum + (module.learningItems?.length || 0), 0) || 0} items
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='mt-2 text-sm text-blue-600 font-medium flex items-center opacity-0 group-hover:opacity-100 transition-opacity'>
                    Click to view and add modules
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </Link>
                <div className='flex-shrink-0 ml-2'>
                  <DeleteLearningPathButton 
                    learningPathId={path.id} 
                    learningPathTitle={path.title} 
                    onDelete={() => handleDelete(path.id)}
                  />
                </div>
              </div>
            </div>
          ))}
          {learningPaths.length > 3 && (
            <div className="text-center mt-4">
              <Link 
                href="/learning-paths" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
              >
                View all {learningPaths.length} learning paths
                <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 -mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className='text-gray-500 italic mb-4'>No learning paths yet.</p>
          <CreateLearningPathButton />
        </div>
      )}
    </div>
  );
}