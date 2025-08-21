"use client";

import React, { useState, useEffect } from 'react';
import Loader from '@/components/Loader';
import Error from '@/components/ErrorBox';
import { useRouter } from 'next/navigation';
import UpcomingExamCard from '@/components/UpcomingExamCard';
import PastExamRow from '@/components/PastExamRow';
import { Plus, Calendar, TrendingUp } from 'lucide-react';
import axios from 'axios';

// Updated interfaces based on API structure
interface ApiTag {
  id: string;
  name: string;
}

interface ApiLanguage {
  id: string;
  name: string;
}

interface ApiUpcomingContest {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  tags: ApiTag[];
  allowedLanguages: ApiLanguage[];
}

interface ApiPastContest {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  tags: ApiTag[];
  allowedLanguages: ApiLanguage[];
  isPublished: boolean;
  participants: number;
}

interface ExamDashboardData {
  upcomingExams: ApiUpcomingContest[];
  pastExams: ApiPastContest[];
}

// Utility function to check if contest is live
const isContestLive = (startTime: Date, endTime: Date): boolean => {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);
  return now >= start && now <= end;
};

const formatDate = (date: Date | string | number): string => {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatTime = (date: Date | string | number): string => {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};


// Utility function to calculate duration in minutes
const calculateDuration = (startTime: Date, endTime: Date): string => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationMs = end.getTime() - start.getTime();
  const minutes = Math.floor(durationMs / (1000 * 60));
  return `${minutes}m`;
};

// Utility function to convert API tag to display tag
const convertApiTagToDisplayTag = (tag: ApiTag) => {
  const colorClasses = [
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-purple-100 text-purple-800',
    'bg-red-100 text-red-800',
    'bg-yellow-100 text-yellow-800',
    'bg-indigo-100 text-indigo-800',
    'bg-pink-100 text-pink-800',
    'bg-orange-100 text-orange-800'
  ];

  // Simple hash function to consistently assign colors
  const hash = tag.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorClass = colorClasses[hash % colorClasses.length];

  return {
    name: tag.name,
    color: colorClass
  };
};

// Main Dashboard Component
const ExamDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<ExamDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  // Fetch dashboard data from APIs
  const fetchDashboardData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError('');

      // Fetch both upcoming and past contests
      const [upcomingResponse, pastResponse] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/contests`, {
          withCredentials: true,
        }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/contests/past`, {
          withCredentials: true,
        })
      ]);

      setDashboardData({
        upcomingExams: upcomingResponse.data.data.contests || [],
        pastExams: pastResponse.data.data.contests || []
      });

    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (examId: string) => {
    router.push(`/teacher/contest/${examId}/manage`);
  };

  const handleDelete = async (examId: string) => {
    try {
      // Add confirmation dialog
      if (!confirm('Are you sure you want to delete this exam?')) {
        return;
      }

      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/contests/${examId}`, {
        withCredentials: true,
      });

      // Refresh dashboard data after deletion
      await fetchDashboardData();
    } catch (err: any) {
      console.error('Error deleting exam:', err);
      setError(err.response?.data?.message || 'Failed to delete exam');
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateExam = () => {
    router.push('/teacher/contest/create');
  };

  // Show loading spinner while fetching data
  if (isLoading) {
    return <Loader text="Loading Exam Dashboard" />;
  }

  // Show error message if there's an error
  if (error) {
    return <Error message={error} onRetry={fetchDashboardData} />;
  }

  // Transform API data for display
  const transformUpcomingExam = (exam: ApiUpcomingContest) => ({
    id: exam.id,
    title: exam.title,
    description: exam.description,
    tags: exam.tags.map(convertApiTagToDisplayTag),
    date: formatDate(exam.startTime),
    time: formatTime(exam.startTime),
    duration: calculateDuration(exam.startTime, exam.endTime),
    live: isContestLive(exam.startTime, exam.endTime),
  });

  const transformPastExam = (exam: ApiPastContest) => ({
    id: exam.id,
    title: exam.title,
    description: exam.description,
    date: formatDate(exam.startTime),
    time: formatTime(exam.startTime),
    totalParticipants: exam.participants,
    isPublished: exam.isPublished,
  });

  const upcomingExams = dashboardData?.upcomingExams.map(transformUpcomingExam) || [];
  const pastExams = dashboardData?.pastExams.map(transformPastExam) || [];

  return (
    <div className="">
      <div className="p-4">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Upcoming Contests</h2>
                <p className="text-gray-600 mt-1">Contests scheduled for the future</p>
              </div>
              {upcomingExams.filter(exam => exam.live).length > 0 && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  {upcomingExams.filter(exam => exam.live).length} Live Contest{upcomingExams.filter(exam => exam.live).length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
            <button
              className="group bg-qc-dark hover:bg-qc-dark/95 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
              onClick={handleCreateExam}
            >
              <Plus size={20} className=" transition-transform duration-200" />
              Create Exam
            </button>
          </div>
        </div>

        {dashboardData && (
          <>
            {/* Stats Cards */}
            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Upcoming</p>
                    <p className="text-3xl font-bold text-blue-600">{upcomingExams.length}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Calendar className="text-blue-600" size={24} />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Live Contests</p>
                    <p className="text-3xl font-bold text-green-600">
                      {upcomingExams.filter(exam => exam.live).length}
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <div className="w-6 h-6 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Past Contests</p>
                    <p className="text-3xl font-bold text-purple-600">{pastExams.length}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <TrendingUp className="text-purple-600" size={24} />
                  </div>
                </div>
              </div>
            </div> */}

            {/* Upcoming Exams Section */}
            <div className="mb-12">


              {upcomingExams.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-gray-100">
                  <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="text-gray-400" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Upcoming Contests</h3>
                  <p className="text-gray-600 mb-6">You haven't scheduled any contests yet.</p>
                  <button
                    onClick={handleCreateExam}
                    className="bg-qc-dark text-white px-6 py-3 rounded-xl font-medium hover:bg-qc-dark/90 transition-colors"
                  >
                    Create Your First Contest
                  </button>
                </div>
              ) : (
                <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                  {upcomingExams.map((exam) => (
                    <UpcomingExamCard
                      key={exam.id}
                      exam={exam}
                      handleView={() => handleView(exam.id)}
                      role="teacher"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Past Exams Section */}
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Past Contests</h2>
                <p className="text-gray-600 mt-1">View results and analytics from completed contests</p>
              </div>

              {pastExams.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-gray-100">
                  <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="text-gray-400" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Past Contests</h3>
                  <p className="text-gray-600">Your completed contests will appear here.</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                  {/* Enhanced Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <div className="grid grid-cols-4 gap-4 py-4 px-6">
                      <div className="font-semibold text-gray-700 text-sm">Contest Details</div>
                      <div className="font-semibold text-gray-700 text-center text-sm">Date & Time</div>
                      <div className="font-semibold text-gray-700 text-center text-sm">Participants</div>
                      <div className="font-semibold text-gray-700 text-center text-sm">Actions</div>
                    </div>
                  </div>

                  {/* Rows */}
                  <div className="  ">
                    {pastExams.map((exam, index) => (
                      <PastExamRow
                        key={exam.id}
                        exam={{
                          ...exam,
                          rank: 0, // Not applicable for teacher
                          solved: '0/0', // Not applicable for teacher
                          totalProblems: 0, // Not applicable for teacher
                        }}
                        isLast={index === pastExams.length - 1}
                        role="teacher"
                        handleView={() => handleView(exam.id)}
                        handleDelete={() => handleDelete(exam.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ExamDashboard;