"use client";

import React, { useState, useEffect } from 'react';
import Loader from '@/components/Loader';
import Error from '@/components/ErrorBox';
import { useRouter } from 'next/navigation';
import UpcomingExamCard from '@/components/UpcomingExamCard';
import PastExamRow from '@/components/PastExamRow';
import { UpcomingExam, PastExam } from '@/types/dashboard';

interface ExamDashboardData {
  upcomingExams: UpcomingExam[];
  pastExams: PastExam[];
}

// Mock data
const mockData: ExamDashboardData = {
  upcomingExams: [
    {
      id: '1',
      title: 'Data Structures Sprint',
      description: 'Focus on trees, heaps, and advanced data structures.',
      tags: [
        { name: 'Array', color: 'bg-blue-100 text-blue-800' },
        { name: 'Stack', color: 'bg-green-100 text-green-800' },
        { name: 'Heap', color: 'bg-purple-100 text-purple-800' }
      ],
      date: '8/8/2025',
      time: '09:26 AM',
      duration: '120m',
      live: true,
      teacher: 'John Doe'
    },
    {
      id: '2',
      title: 'Java Quick Sprint',
      description: 'Focus on trees, heaps, and advanced data structures.',
      tags: [
        { name: 'Array', color: 'bg-blue-100 text-blue-800' },
        { name: 'Stack', color: 'bg-green-100 text-green-800' },
        { name: 'Heap', color: 'bg-purple-100 text-purple-800' }
      ],
      date: '9/8/2025',
      time: '09:26 AM',
      duration: '120m',
      live: false,
      teacher: 'Jane Smith'
    },
    {
      id: '3',
      title: 'Data Structures Sprint Pro',
      description: 'Focus on trees, heaps, and advanced data structures.',
      tags: [
        { name: 'Array', color: 'bg-blue-100 text-blue-800' },
        { name: 'Stack', color: 'bg-green-100 text-green-800' },
        { name: 'Heap', color: 'bg-purple-100 text-purple-800' }
      ],
      date: '8/8/2025',
      time: '09:26 AM',
      duration: '120m',
      live: false,
      teacher: 'Alice Johnson'
    },
    {
      id: '4',
      title: 'Algorithm Mastery Challenge',
      description: 'Advanced algorithms and optimization problems.',
      tags: [
        { name: 'Graph', color: 'bg-red-100 text-red-800' },
        { name: 'DP', color: 'bg-yellow-100 text-yellow-800' },
        { name: 'Sorting', color: 'bg-indigo-100 text-indigo-800' }
      ],
      date: '10/8/2025',
      time: '10:30 AM',
      duration: '180m',
      live: false,
      teacher: 'Bob Brown'
    }
  ],
  pastExams: [
    {
      id: '1',
      title: 'Algorithm Mastery Contest',
      description: 'Advanced algorithms and optimization problems.',
      date: '7/30/2025',
      time: '09:42 AM',
      rank: 42,
      solved: '3/4',
      totalProblems: 4
    },
    {
      id: '2',
      title: 'Binary Search Deep Dive',
      description: 'Master binary search and its variations.',
      date: '7/23/2025',
      time: '09:42 AM',
      rank: 18,
      solved: '3/4',
      totalProblems: 4
    },
    {
      id: '3',
      title: 'Algorithm Mastery Contest',
      description: 'Advanced algorithms and optimization problems.',
      date: '7/30/2025',
      time: '09:42 AM',
      rank: 42,
      solved: '3/4',
      totalProblems: 4
    },
    {
      id: '4',
      title: 'Algorithm Mastery Contest',
      description: 'Advanced algorithms and optimization problems.',
      date: '7/30/2025',
      time: '09:42 AM',
      rank: 42,
      solved: '3/4',
      totalProblems: 4
    }
  ]
};

// Main Dashboard Component
const ExamDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<ExamDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  // Simulate API call
  const fetchDashboardData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError('');

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real app, this would be:
      // const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/exams`, {
      //   withCredentials: true,
      // });
      // setDashboardData(response.data);

      setDashboardData(mockData);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = () => {
    router.push('/coding/contest');
  }

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

  return (
    <div className="p-4 ">
      <div className="">
        {dashboardData && (
          <>
            {/* Upcoming Exams Section */}
            <div className="mb-8 ">
              <h2 className="text-2xl font-bold  text-qc-primary mb-6">Upcoming exam</h2>
              <div className="flex gap-4 overflow-x-auto pb-4 w-6xl scrollbar-hide">
                {dashboardData.upcomingExams.map((exam) => (
                  <UpcomingExamCard key={exam.id} exam={exam}
                    handleJoin={handleJoin}
                  />
                ))}
              </div>
            </div>

            {/* Past Exams Section */}
            <div>
              <h2 className="text-2xl font-bold text-qc-primary mb-6">Past exams</h2>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-4 gap-4 py-3 px-4 bg-gray-100 border-b border-gray-200">
                  <div className="font-semibold text-qc-primary text-sm">Exam</div>
                  <div className="font-semibold text-qc-primary text-sm">Date & timing</div>
                  <div className="font-semibold text-qc-primary text-center text-sm">Rank</div>
                  <div className="font-semibold text-qc-primary text-center text-sm">Solved</div>
                </div>

                {/* Rows */}
                {dashboardData.pastExams.map((exam, index) => (
                  <PastExamRow
                    key={exam.id}
                    exam={exam}
                    isLast={index === dashboardData.pastExams.length - 1}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ExamDashboard;