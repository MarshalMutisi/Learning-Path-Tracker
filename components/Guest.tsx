import { SignInButton } from '@clerk/nextjs';
import Image from 'next/image'; // Added import for Next.js Image component

const Guest = () => {
  return (
    <div className='font-sans bg-gray-100 text-gray-800'>
      {/* Hero Section */}
      <div className='flex flex-col md:flex-row items-center justify-between p-3 md:p-16 bg-gray-100 pt-20'>
        <div className='flex-1 mb-8 xl:pl-10'>
          <h1 className='text-2xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent'>
            Welcome to Learning Path Tracker
          </h1>
          <p className='md:text-xl mb-6'>
            Organize your developer learning journey — plan goals, track progress, 
            and visualize your growth in one place.
          </p>
          <SignInButton>
            <button className='w-full md:w-auto bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white px-4 py-2 rounded-md font-medium cursor-pointer'>
              Get Started
            </button>
          </SignInButton>
        </div>
        <div className='flex-1 flex justify-center items-center'>
          <Image
            src='/learning_tracker.png' // Added leading slash for absolute path
            alt='Learning Path Tracker Illustration'
            width={512} // Set appropriate width
            height={384} // Set appropriate height (maintains aspect ratio)
            className='w-full md:max-w-md rounded-tl-3xl rounded-br-3xl shadow-lg'
          />
        </div>
      </div>

      {/* Divider */}
      <div className='h-1 bg-gray-300'></div>

      {/* Frequently Asked Questions Section */}
      <div className='py-16 px-8 bg-white'>
        <h2 className='text-2xl md:text-3xl font-bold text-center mb-8'>
          Frequently Asked Questions
        </h2>
        <div className='max-w-3xl mx-auto space-y-8'>
          <div>
            <h3 className='text-xl font-bold'>What is Learning Path Tracker?</h3>
            <p className='text-gray-600'>
              Learning Path Tracker is a tool designed to help developers plan and manage their continuous learning — from tutorials and courses to projects and skills.
            </p>
          </div>
          <div>
            <h3 className='text-xl font-bold'>How does it work?</h3>
            <p className='text-gray-600'>
              You can create learning goals, add resources, track progress, and reflect on your completed paths through a clean and visual dashboard.
            </p>
          </div>
          <div>
            <h3 className='text-xl font-bold'>Is it free?</h3>
            <p className='text-gray-600'>
              Yes, Learning Path Tracker is free to use with core features. Premium options will offer advanced analytics and personalized recommendations.
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className='h-1 bg-gray-300'></div>

      {/* Testimonials Section */}
      <div className='py-16 px-8 bg-gray-100'>
        <h2 className='text-2xl md:text-3xl font-bold text-center mb-8'>
          What Developers Say
        </h2>
        <div className='max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8'>
          <div className='bg-white p-6 rounded-md shadow'>
            <p className='text-gray-700 mb-4'>
              &quot;Learning Path Tracker helped me stay consistent with my React learning plan. I finally finished all my tutorials!&quot;
            </p>
            <p className='text-purple-500 font-bold'>- Sarah L.</p>
          </div>
          <div className='bg-white p-6 rounded-md shadow'>
            <p className='text-gray-700 mb-4'>
              &quot;I love how I can visualize my progress across different technologies — it keeps me motivated!&quot;
            </p>
            <p className='text-purple-500 font-bold'>- John D.</p>
          </div>
          <div className='bg-white p-6 rounded-md shadow'>
            <p className='text-gray-700 mb-4'>
              &quot;This app brought order to my chaotic learning routine. Every developer should try it!&quot;
            </p>
            <p className='text-purple-500 font-bold'>- Emily R.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Guest;