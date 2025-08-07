"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import Loader from '@/components/Loader';
import Error from '@/components/ErrorBox';

// Types
interface ExamTag {
  name: string;
  color: string;
}

interface UpcomingExam {
  id: string;
  title: string;
  description: string;
  tags: ExamTag[];
  date: string;
  time: string;
  duration: string;
}

interface PastExam {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  rank: number;
  solved: string;
  totalProblems: number;
}

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
      duration: '120m'
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
      duration: '120m'
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
      duration: '120m'
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
      duration: '180m'
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

// Reusable Components
const ExamTag: React.FC<{ tag: ExamTag }> = ({ tag }) => (
  <span className={`px-3 py-1 rounded-full text-xs font-medium ${tag.color}`}>
    {tag.name}
  </span>
);

const UpcomingExamCard: React.FC<{ exam: UpcomingExam }> = ({ exam }) => (
  <div className="bg-slate-800 rounded-2xl p-5 text-white min-w-[300px] max-w-[320px] flex-shrink-0">
    <div className="mb-5">
      <h3 className="text-lg font-semibold mb-2">{exam.title}</h3>
      <p className="text-slate-300 text-sm leading-relaxed">{exam.description}</p>
    </div>

    <div className="flex flex-wrap gap-2 mb-5">
      {exam.tags.map((tag, index) => (
        <ExamTag key={index} tag={tag} />
      ))}
    </div>

    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 text-xs text-slate-300">
        <div className="flex items-center gap-1">
          <Calendar size={14} />
          <span>{exam.date} {exam.time}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={14} />
          <span>{exam.duration}</span>
        </div>
      </div>
      <button className="bg-white text-slate-800 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors">
        Join
      </button>
    </div>
  </div>
);

const PastExamRow: React.FC<{ exam: PastExam; isLast: boolean }> = ({ exam, isLast }) => {
  const solvedCount = parseInt(exam.solved.split('/')[0]);
  const totalCount = parseInt(exam.solved.split('/')[1]);
  const solvedPercentage = (solvedCount / totalCount) * 100;

  return (
    <div className={`grid grid-cols-4 gap-4 py-4 px-4 ${!isLast ? 'border-b border-gray-200' : ''}`}>
      <div>
        <h4 className="font-semibold text-gray-900 mb-1 text-sm">{exam.title}</h4>
        <p className="text-xs text-gray-600">{exam.description}</p>
      </div>

      <div className="text-gray-900 text-sm">
        <p>{exam.date} {exam.time}</p>
      </div>

      <div className="text-center">
        <span className="inline-flex items-center justify-center w-10 h-6 bg-gray-100 text-gray-800 rounded text-xs font-semibold">
          #{exam.rank}
        </span>
      </div>

      <div className="text-center">
        <div className="inline-flex items-center justify-center px-3 py-1 bg-gray-100 rounded text-xs">
          <span className="font-semibold text-gray-900">{exam.solved}</span>
          {solvedPercentage === 100 && (
            <CheckCircle className="ml-1 text-green-500" size={12} />
          )}
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const ExamDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<ExamDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

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
              <h2 className="text-2xl font-bold  text-gray-900 mb-6">Upcoming exam</h2>
              <div className="flex gap-4 overflow-x-auto pb-4 w-6xl scrollbar-hide">
                {dashboardData.upcomingExams.map((exam) => (
                  <UpcomingExamCard key={exam.id} exam={exam} />
                ))}
              </div>
            </div>

            {/* Past Exams Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Past exams</h2>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-4 gap-4 py-3 px-4 bg-gray-100 border-b border-gray-200">
                  <div className="font-semibold text-gray-900 text-sm">Exam</div>
                  <div className="font-semibold text-gray-900 text-sm">Date & timing</div>
                  <div className="font-semibold text-gray-900 text-center text-sm">Rank</div>
                  <div className="font-semibold text-gray-900 text-center text-sm">Solved</div>
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