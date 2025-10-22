// File: app/create-learning-path/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
// Removed the unused import: import { revalidatePath } from 'next/cache';

const CreateLearningPathPage = () => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/learning-paths', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create learning path');
      }

      // Revalidate the home page to refresh the data
      await fetch('/api/revalidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: '/' }),
      });

      // Redirect to home page after successful creation
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-600">Create Learning Path</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Web Development Fundamentals"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe what you'll learn in this path..."
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create Path'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLearningPathPage;