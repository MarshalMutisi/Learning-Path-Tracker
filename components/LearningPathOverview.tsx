// File: app/components/LearningPathOverview.tsx

interface LearningPath {
  id: string;
  title: string;
  description?: string;
  progress: number;
  modules: {
    length: number;
  };
}

const LearningPathOverview = ({ learningPaths }: { learningPaths: LearningPath[] }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-blue-600">Your Learning Paths</h3>
      
      {learningPaths.length === 0 ? (
        <p className="text-gray-500 italic">No learning paths yet. Create your first path to get started!</p>
      ) : (
        <div className="space-y-4">
          {learningPaths.slice(0, 3).map(path => (
            <div key={path.id} className="border-l-4 border-blue-500 pl-4 py-2">
              <h4 className="font-medium text-gray-800">{path.title}</h4>
              <p className="text-sm text-gray-600 truncate">{path.description || 'No description'}</p>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${path.progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round(path.progress)}% complete • {path.modules.length} modules
              </p>
            </div>
          ))}
          {learningPaths.length > 3 && (
            <p className="text-sm text-blue-600 font-medium">
              + {learningPaths.length - 3} more learning paths
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default LearningPathOverview;