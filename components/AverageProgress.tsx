// File: components/AverageProgress.tsx
'use client';

interface ProgressData {
  averageProgress: number;
  totalPaths: number;
  completedPaths: number;
  inProgressPaths: number;
  notStartedPaths: number;
}

const AverageProgress = ({ progressData }: { progressData: ProgressData }) => {
  const { averageProgress, totalPaths, completedPaths, inProgressPaths, notStartedPaths } = progressData;
  
  // Determine progress quality based on average
  let progressQuality = '';
  let qualityColor = '';
  let qualityBgColor = '';
  
  if (averageProgress < 25) {
    progressQuality = 'Just Started';
    qualityColor = 'text-red-600';
    qualityBgColor = 'bg-red-100';
  } else if (averageProgress < 50) {
    progressQuality = 'Making Progress';
    qualityColor = 'text-yellow-600';
    qualityBgColor = 'bg-yellow-100';
  } else if (averageProgress < 75) {
    progressQuality = 'Good Progress';
    qualityColor = 'text-blue-600';
    qualityBgColor = 'bg-blue-100';
  } else {
    progressQuality = 'Excellent';
    qualityColor = 'text-green-600';
    qualityBgColor = 'bg-green-100';
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Learning Progress Overview</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Average Progress</p>
            <p className={`text-2xl font-bold ${qualityColor}`}>
              {averageProgress}%
            </p>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${qualityBgColor} ${qualityColor}`}>
              {progressQuality}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Total Paths</p>
            <p className="text-xl font-semibold text-gray-800">{totalPaths}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Completed</p>
            <p className="text-xl font-semibold text-green-600">{completedPaths}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">In Progress</p>
            <p className="text-xl font-semibold text-blue-600">{inProgressPaths}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Not Started</p>
            <p className="text-xl font-semibold text-gray-600">{notStartedPaths}</p>
          </div>
        </div>
        
        {/* Progress bars for visual representation */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Completed</span>
            <span className="text-gray-600">{Math.round((completedPaths / totalPaths) * 100) || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full" 
              style={{ width: `${(completedPaths / totalPaths) * 100 || 0}%` }}
            ></div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">In Progress</span>
            <span className="text-gray-600">{Math.round((inProgressPaths / totalPaths) * 100) || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full" 
              style={{ width: `${(inProgressPaths / totalPaths) * 100 || 0}%` }}
            ></div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Not Started</span>
            <span className="text-gray-600">{Math.round((notStartedPaths / totalPaths) * 100) || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gray-500 h-2 rounded-full" 
              style={{ width: `${(notStartedPaths / totalPaths) * 100 || 0}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AverageProgress;