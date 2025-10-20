import Link from 'next/link';

const AboutPage = () => {
  return (
    <div className='font-sans bg-gray-100 text-gray-800'>
      {/* Hero Section */}
      <section className='flex flex-col items-center justify-center text-center py-16 px-8 bg-gray-100'>
        <h1 className='text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent'>
          About Learning Path Tracker
        </h1>
        <p className='text-lg md:text-xl bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent'>
          Helping developers stay organized, motivated, and intentional in their learning journeys.
        </p>
      </section>

      {/* Problem Section */}
      <section className='py-16 px-8 bg-white'>
        <h2 className='text-3xl font-bold text-center mb-8'>Why We Built This</h2>
        <p className='text-gray-600 max-w-3xl mx-auto text-center'>
          As developers, we’re constantly learning new technologies, frameworks, and tools.
          But managing this continuous learning process can be chaotic. Tutorials get
          bookmarked and forgotten, notes are scattered across different apps, and progress
          is often tracked mentally. This leads to abandoned learning goals, duplicated effort,
          and little visibility into how much we’ve truly grown.
        </p>
        <p className='text-gray-600 max-w-3xl mx-auto text-center mt-4'>
          Learning Path Tracker was built to solve this problem — a centralized, visual tool
          made specifically for developers to plan, track, and reflect on their learning progress.
        </p>
      </section>

      {/* Features Section */}
      <section className='py-16 px-8 bg-gray-100'>
        <h2 className='text-3xl font-bold text-center mb-8'>
          What Learning Path Tracker Offers
        </h2>
        <div className='max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8'>
          <div className='bg-white p-6 rounded-md shadow'>
            <h3 className='text-xl font-bold mb-2'>Structured Learning Paths</h3>
            <p className='text-gray-600'>
              Create personalized paths for any technology stack — from frontend frameworks
              to backend systems — and visualize your learning roadmap.
            </p>
          </div>
          <div className='bg-white p-6 rounded-md shadow'>
            <h3 className='text-xl font-bold mb-2'>Progress Tracking</h3>
            <p className='text-gray-600'>
              Track completed tutorials, document lessons learned, and measure your growth
              with clear progress indicators and milestones.
            </p>
          </div>
          <div className='bg-white p-6 rounded-md shadow'>
            <h3 className='text-xl font-bold mb-2'>Developer-Focused Insights</h3>
            <p className='text-gray-600'>
              Get meaningful insights into your skill development — identify gaps, track
              improvements, and plan your next steps with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className='py-16 px-8 bg-white'>
        <h2 className='text-3xl font-bold text-center mb-8'>Our Story</h2>
        <p className='text-gray-600 max-w-3xl mx-auto text-center'>
          Learning Path Tracker was created by developers, for developers. We know what it’s like
          to juggle multiple tutorials, courses, and side projects — only to lose track of progress.
          Our goal is to bring clarity and motivation to the developer learning process by turning
          scattered notes into a structured, trackable journey.
        </p>
        <p className='text-gray-600 max-w-3xl mx-auto text-center mt-4'>
          Since its creation, Learning Path Tracker has helped developers organize their learning,
          set achievable goals, and actually see their growth over time — all in one place.
        </p>
      </section>

      {/* Call to Action Section */}
      <section className='py-16 px-8 bg-gray-100 text-center'>
        <h2 className='text-3xl font-bold mb-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent'>
          Ready to Take Control of Your Learning Journey?
        </h2>
        <p className='text-lg mb-6 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent'>
          Join Learning Path Tracker today and bring structure, visibility, and motivation
          to your development journey.
        </p>
        <Link
          href='/sign-up'
          className='inline-block bg-white text-purple-600 hover:text-purple-700 px-6 py-3 rounded-md font-medium shadow-md transition'
        >
          Get Started
        </Link>
      </section>
    </div>
  );
};

export default AboutPage;
