// File: components/CreateLearningPathButton.tsx
'use client';
import Link from 'next/link';

const CreateLearningPathButton = () => {
  return (
    <Link 
      href="/create-learning-path" 
      className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
    >
      Create Learning Path
    </Link>
  );
};

export default CreateLearningPathButton;