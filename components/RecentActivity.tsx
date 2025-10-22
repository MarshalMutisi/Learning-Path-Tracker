// File: components/RecentActivity.tsx
'use client';

interface ActivityItem {
  id: string;
  title: string;
  type: string;
  progress: number;
  date: string;
  pathTitle: string;
}

const RecentActivity = ({ activities }: { activities: ActivityItem[] }) => {
  // Sort activities by date (newest first)
  const sortedActivities = [...activities].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Take only the last 5 activities
  const recentActivities = sortedActivities.slice(0, 5);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
      
      {recentActivities.length === 0 ? (
        <p className="text-gray-500 italic text-center py-4">
          No recent activity found
        </p>
      ) : (
        <div className="space-y-3">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3 py-3 border-b border-gray-100 last:border-0">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                activity.progress === 100 ? 'bg-green-100 text-green-600' :
                activity.progress > 0 ? 'bg-blue-100 text-blue-600' :
                'bg-gray-100 text-gray-600'
              }`}>
                {activity.progress === 100 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-8-8a1 1 0 010-1.414l8-8z" clipRule="evenodd" />
                  </svg>
                ) : activity.progress > 0 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 12.293a1 1 0 001.414 1.414L11 13.414l4.293-4.293a1 1 0 001.414 1.414L13.414 11l2.293 2.293a1 1 0 001.414-1.414L15 8.586l-2.293-2.293a1 1 0 00-1.414-1.414L10 6.586 7.707 4.293a1 1 0 00-1.414 0l-8 8z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 001.414 0l4-4a1 1 0 000-1.414l-1.293-1.293A1 1 0 0010 8.586V7a1 1 0 100-2h-3.586l1.293-1.293a1 1 0 00-1.414 0l-4 4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {activity.title}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {activity.pathTitle}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">
                    {formatDate(activity.date)}
                  </span>
                  <span className={`text-xs font-medium ${
                    activity.progress === 100 ? 'text-green-600' :
                    activity.progress > 0 ? 'text-blue-600' :
                    'text-gray-600'
                  }`}>
                    {activity.progress}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;