// File: components/AddLearningRecord.tsx
'use client';
import { useState, useEffect } from 'react';
import addLearningRecord from '@/app/actions/AddLearningRecord';

interface LearningItem {
  id: string;
  title: string;
  type: string;
  url?: string;
  isComplete: boolean;
  moduleId: string;
  moduleTitle: string;
  pathTitle: string;
}

const AddLearningRecord = ({ learningPaths }: { learningPaths: any[] }) => {
  const [selectedItemId, setSelectedItemId] = useState('');
  const [content, setContent] = useState('');
  const [progress, setProgress] = useState(50);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [learningItems, setLearningItems] = useState<LearningItem[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Process learning paths to extract learning items
  useEffect(() => {
    try {
      console.log('Processing learning paths:', learningPaths);
      
      if (learningPaths && learningPaths.length > 0) {
        const items = learningPaths.flatMap(path => {
          console.log('Processing path:', path.title);
          return path.modules?.flatMap(module => {
            console.log('Processing module:', module.title);
            return module.learningItems?.map(item => {
              console.log('Processing item:', item.title);
              return {
                id: item.id,
                title: item.title,
                type: item.type,
                url: item.url,
                isComplete: item.isComplete,
                moduleId: module.id,
                moduleTitle: module.title,
                pathTitle: path.title,
              };
            }) || [];
          }) || [];
        });
        
        console.log('Final learning items:', items);
        setLearningItems(items);
      } else {
        console.log('No learning paths found');
        setLearningItems([]);
      }
    } catch (error) {
      console.error('Error processing learning paths:', error);
      setLearningItems([]);
    } finally {
      setIsDataLoaded(true);
    }
  }, [learningPaths]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('progress', progress.toString());
      formData.append('date', date);
      formData.append('learningItemId', selectedItemId);

      const result = await addLearningRecord(formData);

      if (result.error) {
        setMessage({ text: result.error, type: 'error' });
      } else {
        setMessage({ text: 'Learning record added successfully!', type: 'success' });
        setContent('');
        setProgress(50);
        setSelectedItemId('');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setMessage({ text: 'Failed to add learning record. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isDataLoaded) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-blue-600">Add Learning Record</h3>
        <div className="text-center py-6">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-500">Loading learning data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-blue-600">Add Learning Record</h3>
      
      {message && (
        <div className={`mb-4 p-3 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {learningItems.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500 mb-2">No learning items available</p>
          <p className="text-gray-500 text-sm">Create a learning path with modules and items first</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Learning Item Selection */}
          <div>
            <label htmlFor="learningItem" className="block text-sm font-medium text-gray-700 mb-2">
              Learning Item
            </label>
            <select
              id="learningItem"
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a learning item</option>
              {learningItems.map(item => (
                <option key={item.id} value={item.id}>
                  {item.pathTitle} {'>'} {item.moduleTitle} {'>'} {item.title}
                </option>
              ))}
            </select>
          </div>

          {/* What did you learn? */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              What did you learn?
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe what you learned, key takeaways, insights, etc."
              required
            />
          </div>

          {/* Progress Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="progress" className="block text-sm font-medium text-gray-700">
                Progress
              </label>
              <span className="text-sm font-medium text-blue-600">{progress}%</span>
            </div>
            <input
              id="progress"
              type="range"
              min="0"
              max="100"
              step="5"
              value={progress}
              onChange={(e) => setProgress(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading || !selectedItemId}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Learning Record'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddLearningRecord;