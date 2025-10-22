// File: app/learning-path/[id]/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DeleteLearningPathButton from '@/components/DeleteLearningPathButton';

interface Module {
  id: string;
  title: string;
  description?: string;
  order: number;
  learningItems: LearningItem[];
}

interface LearningItem {
  id: string;
  title: string;
  url?: string;
  type: string;
  isComplete: boolean;
  estimatedHours?: number;
  order: number;
}

interface LearningPath {
  id: string;
  title: string;
  description?: string;
  progress: number;
  modules: Module[];
}

export default function LearningPathPage() {
  const params = useParams();
  const router = useRouter();
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModule, setShowAddModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [showAddItem, setShowAddItem] = useState<string | null>(null);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemType, setNewItemType] = useState('TUTORIAL');
  const [newItemUrl, setNewItemUrl] = useState('');

  useEffect(() => {
    const fetchLearningPath = async () => {
      try {
        const response = await fetch(`/api/learning-paths/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch learning path');
        }
        const data = await response.json();
        
        // Normalize data to ensure learningItems is always an array
        const normalizedData = {
          ...data,
          modules: data.modules.map((module: Module) => ({
            ...module,
            learningItems: module.learningItems || []
          }))
        };
        
        setLearningPath(normalizedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchLearningPath();
  }, [params.id]);

  // Function to handle path deletion
  const handlePathDeleted = () => {
    // Redirect to home page after deletion
    router.push('/');
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim() || !learningPath) return;

    try {
      const response = await fetch(`/api/learning-paths/${params.id}/modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newModuleTitle,
          order: learningPath.modules.length,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add module');
      }

      const newModule = await response.json();
      setLearningPath({
        ...learningPath,
        modules: [...learningPath.modules, newModule],
      });
      setNewModuleTitle('');
      setShowAddModule(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleAddItem = async (moduleId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim() || !learningPath) return;

    try {
      const response = await fetch(`/api/learning-paths/${params.id}/modules/${moduleId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newItemTitle,
          type: newItemType,
          url: newItemUrl || null,
          order: (learningPath.modules.find(m => m.id === moduleId)?.learningItems || []).length,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add learning item');
      }

      const newItem = await response.json();
      setLearningPath({
        ...learningPath,
        modules: learningPath.modules.map(module => 
          module.id === moduleId 
            ? { 
                ...module, 
                learningItems: [...(module.learningItems || []), newItem] 
              }
            : module
        ),
      });
      setNewItemTitle('');
      setNewItemUrl('');
      setNewItemType('TUTORIAL');
      setShowAddItem(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleToggleComplete = async (itemId: string, isComplete: boolean) => {
    if (!learningPath) return;

    try {
      const response = await fetch(`/api/learning-items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isComplete }),
      });

      if (!response.ok) {
        throw new Error('Failed to update item');
      }

      // Update the learning path with the updated item
      setLearningPath({
        ...learningPath,
        modules: learningPath.modules.map(module => ({
          ...module,
          learningItems: (module.learningItems || []).map(item => 
            item.id === itemId ? { ...item, isComplete } : item
          ),
        })),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (!learningPath) return <div className="p-8 text-center">Learning path not found</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{learningPath.title}</h1>
                {learningPath.description && (
                  <p className="text-gray-600 mt-2">{learningPath.description}</p>
                )}
              </div>
              
              {/* Delete Button in a more prominent position */}
              <DeleteLearningPathButton 
                learningPathId={learningPath.id} 
                learningPathTitle={learningPath.title}
                onDelete={handlePathDeleted}
              />
            </div>
            
            <div className="mt-4">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 mr-2">Progress:</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600" 
                    style={{ width: `${learningPath.progress}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-700 ml-2">
                  {Math.round(learningPath.progress)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar - Add a clear section for actions */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Modules</h2>
          <button 
            onClick={() => setShowAddModule(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Module
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {learningPath.modules.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No modules yet</h3>
              <p className="text-gray-500 mb-6">Add your first module to get started with this learning path.</p>
              <button 
                onClick={() => setShowAddModule(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Your First Module
              </button>
            </div>
          ) : (
            learningPath.modules.map((module) => (
              <div key={module.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                  <h2 className="text-xl font-semibold text-gray-900">{module.title}</h2>
                  {module.description && (
                    <p className="text-gray-600 mt-1">{module.description}</p>
                  )}
                </div>
                
                {(module.learningItems || []).length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No learning items yet</h3>
                    <p className="text-gray-500 mb-6">Add your first learning item to this module.</p>
                    <button 
                      onClick={() => setShowAddItem(module.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add Learning Item
                    </button>
                  </div>
                ) : (
                  <ul className="divide-y">
                    {(module.learningItems || []).map((item) => (
                      <li key={item.id} className="p-4 flex items-center hover:bg-gray-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={item.isComplete}
                          onChange={(e) => handleToggleComplete(item.id, e.target.checked)}
                          className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div className="ml-3 flex-1">
                          <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                          {item.url && (
                            <a 
                              href={item.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center mt-1"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              View Resource
                            </a>
                          )}
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {item.type}
                            </span>
                            {item.estimatedHours && (
                              <span className="ml-2 inline-flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {item.estimatedHours} hours
                              </span>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                
                <div className="p-4 border-t bg-gray-50">
                  <button 
                    onClick={() => setShowAddItem(module.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Learning Item
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Floating Add Module Button for when there are modules */}
        {learningPath.modules.length > 0 && (
          <div className="fixed bottom-8 right-8">
            <button 
              onClick={() => setShowAddModule(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center transition-all transform hover:scale-105"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Module
            </button>
          </div>
        )}

        {/* Add Module Modal */}
        {showAddModule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Module</h3>
                <form onSubmit={handleAddModule}>
                  <div className="mb-4">
                    <label htmlFor="moduleTitle" className="block text-sm font-medium text-gray-700 mb-1">
                      Module Title
                    </label>
                    <input
                      type="text"
                      id="moduleTitle"
                      value={newModuleTitle}
                      onChange={(e) => setNewModuleTitle(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter module title"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowAddModule(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add Module
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Add Learning Item Modal */}
        {showAddItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Learning Item</h3>
                <form onSubmit={(e) => handleAddItem(showAddItem, e)}>
                  <div className="mb-4">
                    <label htmlFor="itemTitle" className="block text-sm font-medium text-gray-700 mb-1">
                      Item Title
                    </label>
                    <input
                      type="text"
                      id="itemTitle"
                      value={newItemTitle}
                      onChange={(e) => setNewItemTitle(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter item title"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="itemType" className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      id="itemType"
                      value={newItemType}
                      onChange={(e) => setNewItemType(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="VIDEO">Video</option>
                      <option value="ARTICLE">Article</option>
                      <option value="COURSE">Course</option>
                      <option value="BOOK">Book</option>
                      <option value="TUTORIAL">Tutorial</option>
                      <option value="DOCUMENTATION">Documentation</option>
                      <option value="EXERCISE">Exercise</option>
                      <option value="PROJECT">Project</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="itemUrl" className="block text-sm font-medium text-gray-700 mb-1">
                      URL (Optional)
                    </label>
                    <input
                      type="url"
                      id="itemUrl"
                      value={newItemUrl}
                      onChange={(e) => setNewItemUrl(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowAddItem(null)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add Item
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}