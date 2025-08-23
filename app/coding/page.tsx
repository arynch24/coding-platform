"use client";

import React, { useState, useEffect } from 'react';
import Loader from '@/components/Loader';
import Error from '@/components/ErrorBox';
import { useRouter } from 'next/navigation';
import UpcomingExamCard from '@/components/UpcomingExamCard';
import PastExamRow from '@/components/PastExamRow';
import axios from 'axios';

// --- Types ---
interface ApiTag {
  id: string;
  name: string;
}

interface ApiCreator {
  id: string;
  name: string;
  email: string;
}

interface ApiUpcomingContest {
  id: string;
  title: string;
  description: string;
  startTime: string | Date;
  endTime: string | Date;
  creator: ApiCreator;
  tags: ApiTag[];
}

interface ApiPastContest {
  contest_id: string;
  title: string;
  description: string;
  startDate: string | Date;
  endDate: string | Date;
  maximumPossibleScore: number;
  totalQuestions: number;
  questionsSolved: number;
  finalScore: number;
  rank: number;
  isPublished: boolean;
}

interface StudentExamDashboardData {
  upcomingExams: ApiUpcomingContest[];
  pastExams: ApiPastContest[];
}

// --- Utility Functions ---
const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatTime = (date: Date | string): string => {
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const calculateDuration = (start: Date | string, end: Date | string): string => {
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  const minutes = Math.floor((endTime - startTime) / (1000 * 60));
  return `${minutes}m`;
};

const convertApiTagToDisplayTag = (tag: ApiTag) => {
  const hash = tag.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = [
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-purple-100 text-purple-800',
    'bg-red-100 text-red-800',
    'bg-yellow-100 text-yellow-800',
  ];
  return { name: tag.name, color: colors[hash % colors.length] };
};

// --- Main Component ---
const StudentExamDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<StudentExamDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const router = useRouter();

  // Fetch data
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const [upcomingRes, pastRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/students/contest/upcoming`, { withCredentials: true }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/students/contest/past`, { withCredentials: true })
      ]);

      setDashboardData({
        upcomingExams: upcomingRes.data.data.upcomingContests || [],
        pastExams: pastRes.data.data.pastContests || []
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handlers
  const handleJoin = (examId: string) => {
    router.push(`/contest/${examId}`);
  };

  const handleViewPastExam = (examId: string) => {
    router.push(`/contest/${examId}`);
  };

  if (isLoading) return <Loader text="Loading Exam Dashboard..." />;
  if (error) return <Error message={error} onRetry={fetchDashboardData} />;
  if (!dashboardData) return <Error message="No data available." onRetry={fetchDashboardData} />;

  // Transform upcoming exams data for display
  const upcomingExams = dashboardData.upcomingExams.map(exam => ({
    id: exam.id,
    title: exam.title,
    description: exam.description,
    tags: exam.tags.map(convertApiTagToDisplayTag),
    date: formatDate(exam.startTime),
    time: formatTime(exam.startTime),
    duration: calculateDuration(exam.startTime, exam.endTime),
    live: new Date() >= new Date(exam.startTime) && new Date() <= new Date(exam.endTime),
    teacher: exam.creator.name
  }));

  // Transform past exams data for display
  const pastExams = dashboardData.pastExams.map(exam => ({
    id: exam.contest_id,
    title: exam.title,
    description: exam.description,
    date: formatDate(exam.startDate),
    time: formatTime(exam.startDate),
    rank: exam.rank,
    solved: `${exam.questionsSolved}/${exam.totalQuestions}`,
    totalProblems: exam.totalQuestions,
    totalParticipants: 0, // Not provided in API response
    finalScore: exam.finalScore,
    maximumPossibleScore: exam.maximumPossibleScore,
    isPublished: exam.isPublished
  }));

  return (
    <div className="p-4">
      <div>
        {/* Upcoming Exams Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-qc-primary mb-6">Upcoming exam</h2>
          {upcomingExams.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow">
              <p className="text-gray-600">No upcoming contests available.</p>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 w-full scrollbar-hide">
              {upcomingExams.map((exam) => (
                <UpcomingExamCard
                  key={exam.id}
                  exam={exam}
                  handleJoin={() => handleJoin(exam.id)}
                  role="student"
                />
              ))}
            </div>
          )}
        </div>

        {/* Past Exams Section */}
        <div>
          <h2 className="text-2xl font-bold text-qc-primary mb-6">Past exams</h2>
          {pastExams.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow">
              <p className="text-gray-600">No past contests yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-4 gap-4 py-3 px-4 bg-gray-100 border-b border-gray-200">
                <div className="font-semibold text-qc-primary text-sm">Exam</div>
                <div className="font-semibold text-qc-primary  text-center text-sm">Date & timing</div>
                <div className="font-semibold text-qc-primary text-center text-sm">Rank</div>
                <div className="font-semibold text-qc-primary text-center text-sm">Solved</div>
              </div>

              {/* Rows */}
             {pastExams.map((exam, index) => (
                <div 
                  key={exam.id} 
                  onClick={exam.isPublished ? () => handleViewPastExam(exam.id) : undefined} 
                  className={exam.isPublished ? 'cursor-pointer' : 'cursor-not-allowed'}
                >
                  <PastExamRow
                    exam={exam}
                    isLast={index === pastExams.length - 1}
                    role="student"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentExamDashboard;