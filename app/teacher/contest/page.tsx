"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Users, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Loader from '@/components/Loader';
import Error from '@/components/ErrorBox';
import ProblemCard from '@/components/ContestProblemCard';

// Tag Component
const Tag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="bg-gray-300 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
    {children}
  </span>
);

// Types
interface Problem {
  id: number;
  title: string;
  points: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface SprintData {
  timeRemaining: string;
  date: string;
  instructor: string;
  batch: string;
  subject: string;
  participants: number;
  totalScore: number;
  problems: Problem[];
}

const DataStructureSprint: React.FC = () => {
  const router = useRouter();

  // State management
  const [sprintData, setSprintData] = useState<SprintData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5 second delay

      // Mock API response - replace with actual API call
      const mockData: SprintData = {
        timeRemaining: "02:00:00",
        date: "07/08/2025 . 09:00AM - 11:00AM",
        instructor: "By Professor Satya sai",
        batch: "SOTB1",
        subject: "DSA",
        participants: 212,
        totalScore: 300,
        problems: [
          { id: 1, title: "Palindrome Numbers", points: 50, difficulty: "Easy" },
          { id: 2, title: "Jump Game I", points: 50, difficulty: "Easy" },
          { id: 3, title: "Reverse Array", points: 50, difficulty: "Medium" },
          { id: 4, title: "Fruits Into Basket III", points: 50, difficulty: "Medium" },
          { id: 5, title: "Fruits Into Basket III", points: 50, difficulty: "Hard" },
          { id: 6, title: "Fruits Into Basket III", points: 50, difficulty: "Hard" },
        ]
      };

      setSprintData(mockData);
    } catch (err) {
      setError('Failed to load sprint data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Show loading spinner while fetching data
  if (isLoading) {
    return <Loader text="Loading Exam Dashboard" />;
  }

  // Show error message if there's an error
  if (error) {
    return <Error message={error} onRetry={fetchDashboardData} />;
  }

  // Early return if no data
  if (!sprintData) {
    return <Error message="No sprint data available" onRetry={fetchDashboardData} />;
  }

  const handleBackClick = () => {
    router.back();
  };

  const handleProblemClick = (problemId: number) => {
    router.push(`/question/${problemId}`);
  };

  const handleEditProblem = (problemId: number) => {
    router.push(`/teacher/problem/edit/${problemId}`);
  };

  const handleAddQuestion = () => {
    router.push('/teacher/create-exam/select');
  };

  const handleModerators = () => {
    router.push('/teacher/moderators');
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackClick}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Data Structure Sprint</h1>
              <p className="text-gray-600">Test your algorithmic skills with dynamic programming and graph problems.</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-4xl font-bold text-gray-900 mb-1">{sprintData.timeRemaining}</div>
            <div className="text-gray-600 text-sm">Time remaining</div>
          </div>
        </div>

        {/* Info Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-6">
            <div className="text-gray-900 font-semibold">{sprintData.date}</div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleModerators}
              className="bg-qc-dark/90 hover:bg-qc-dark cursor-pointer text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>{sprintData.participants}</span>
            </button>

            <button
              onClick={handleModerators}
              className="bg-qc-dark/90 hover:bg-qc-dark cursor-pointer text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>Moderators</span>
            </button>
          </div>
        </div>

        {/* Tags Section */}
        <div className="flex items-center space-x-6 mb-8">
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Batches:</span>
            <Tag>{sprintData.batch}</Tag>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Subject:</span>
            <Tag>{sprintData.subject}</Tag>
          </div>

          <div className="ml-auto text-right">
            <div className="text-gray-900 font-bold text-lg">Total score: {sprintData.totalScore}</div>
          </div>
        </div>

        {/* Problems Section */}
        <div className="bg-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Problems</h2>
              <p className="text-gray-600">Click on a problem to start solving</p>
            </div>

            <button
              onClick={handleAddQuestion}
              className="bg-qc-dark/90 hover:bg-qc-dark cursor-pointer text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Qns.</span>
            </button>
          </div>

          <div className="space-y-3">
            {sprintData.problems.map((problem) => (
              <ProblemCard
                key={problem.id}
                number={problem.id}
                title={problem.title}
                points={problem.points}
                difficulty={problem.difficulty}
                onClick={() => handleProblemClick(problem.id)}
                onEdit={() => handleEditProblem(problem.id)}
                role="teacher"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataStructureSprint;