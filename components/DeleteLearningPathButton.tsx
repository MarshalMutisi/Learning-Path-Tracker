// File: app/components/DeleteLearningPathButton.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import deleteLearningPath from '@/app/actions/deleteLearningPath';

interface DeleteLearningPathButtonProps {
  learningPathId: string;
  learningPathTitle: string;
  onDelete?: () => void;
}

export default function DeleteLearningPathButton({ 
  learningPathId, 
  learningPathTitle, 
  onDelete 
}: DeleteLearningPathButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    
    try {
      console.log('Attempting to delete learning path:', learningPathId);
      const result = await deleteLearningPath(learningPathId);
      
      if (result && result.success) {
        console.log('Learning path deleted successfully');
        
        // Call the onDelete callback to update parent component state
        if (onDelete) {
          onDelete();
        }
        
        // If we're on the learning path page, redirect to home
        if (window.location.pathname.includes(`/learning-path/${learningPathId}`)) {
          router.push('/');
        }
      } else {
        setError('Failed to delete learning path');
      }
    } catch (err) {
      console.error('Error deleting learning path:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete learning path';
      setError(errorMessage);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="text-red-600 hover:text-red-800 transition-colors"
        disabled={isDeleting}
      >
        {isDeleting ? 'Deleting...' : 'Delete'}
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{learningPathTitle}"? This action cannot be undone and will permanently remove all associated modules and learning items.
              </p>
              
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
                  <p className="font-medium">Error:</p>
                  <p>{error}</p>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}