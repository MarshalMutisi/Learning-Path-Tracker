import Guest from '@/components/Guest';
import { currentUser } from '@clerk/nextjs/server';

export default async function HomePage() {
  const user = await currentUser();

  if (!user) {
    return <Guest />;
  }

  return (
    <div className='p-8'>
      <h1 className='text-3xl font-bold mb-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent'>
        Learning Path Tracker
      </h1>
      <p className='text-gray-700 text-lg'>
        Welcome back, {user.firstName || 'Developer'}! 👋
      </p>

      <div className='mt-6 text-gray-600'>
        Here’s where your learning journey continues — track your goals, review your
        progress, and explore new paths to grow your skills.
      </div>
    </div>
  );
}
