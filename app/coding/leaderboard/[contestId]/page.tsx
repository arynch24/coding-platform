"use client";

import { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/Loader';
import ErrorMessage from '@/components/ErrorBox';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Tag from '@/components/ui/Tag';
import { formatDate } from '@/lib/utils/formatDateTime';
import { User } from 'lucide-react';

// Types
interface LeaderboardStudent {
  studentId: string;
  studentName: string;
  studentEmail: string;
  totalScore: number;
  questionsSolved: number;
  rank: number;
}

interface ContestLeaderboardData {
  contestId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isPublished: boolean;
  maximumPossibleScore: number;
  totalQuestions: number;
  batches: {
    id: string;
    name: string;
  }[];
  subject: {
    id: string;
    name: string;
  }
  creator: {
    id: string;
    name: string;
  };
  leaderboard: LeaderboardStudent[];
}

const LeaderboardPage = () => {
  const [data, setData] = useState<ContestLeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<LeaderboardStudent | null>(null);

  const router = useRouter();

  // Extract contestId from URL: /teacher/leaderboard/[contestId]
  const pathSegments = typeof window !== 'undefined' ? window.location.pathname.split('/') : [];
  const contestId = pathSegments[3]; // /teacher/leaderboard/[id] → [3]

  // Fetch leaderboard data
  const fetchLeaderboardData = async () => {
    if (!contestId) {
      setError('Contest ID not found in URL.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/contests/teacher/leaderboard/${contestId}`, {
        withCredentials: true,
      });

      const apiData: ContestLeaderboardData = res.data.data;
      setData(apiData);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Failed to load leaderboard data. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
  }, [contestId]);

  const handleRetry = () => {
    fetchLeaderboardData();
  };

  if (loading) {
    return <LoadingSpinner text="Loading Leaderboard..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={handleRetry} />;
  }

  if (!data) {
    return <ErrorMessage message="No leaderboard data found." onRetry={handleRetry} />;
  }

  const { title, description, batches, subject, startDate, creator, endDate, maximumPossibleScore, totalQuestions, leaderboard } = data;
  const participants = leaderboard.length;
  return (
    <div className="p-6">
      <div className='mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{title} - Leaderboard</h1>
            <p className="text-gray-600 mb-4">{description}</p>
          </div>
          <div className="flex items-center gap-2 mt-2 tex-sm text-gray-500">
            <User size={14} className="text-blue-600" />
            <span> By {creator.name}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Date</p>
            <p className="font-medium">{formatDate(new Date(startDate), "short")}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Time</p>
            <p className="font-medium">
              {new Date(startDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}{" "}
              –{" "}
              {new Date(endDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Questions</p>
            <div className="flex flex-wrap gap-1 mt-1">
              <Tag variant="topic">{totalQuestions}</Tag>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Maximum Score</p>
            <div className="flex flex-wrap gap-1 mt-1">
              <Tag variant="topic">{maximumPossibleScore}</Tag>
            </div>
          </div>
        </div>

        {/* Batches & Subject */}
        <div className="flex flex-wrap gap-4 items-center pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Batches:</span>
            {
              batches.map((batch) => (
                <Tag key={batch.id} variant="batch">{batch.name}</Tag>
              ))}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Subject:</span>
            <Tag variant="subject">{subject.name}</Tag>
          </div>
          <div className="ml-auto flex items-center gap-2 text-sm text-gray-600">
            <p className="text-sm text-gray-500">Participants:</p>
            <Tag variant="topic">{participants}</Tag>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-lg shadow-md border border-gray-200 p-6'>
        {/* Leaderboard Table */}
        {leaderboard.length === 0 ? (
          <div className="text-center py-8 bg-gray-100 rounded-lg">
            <p className="text-gray-600">No students have participated yet.</p>
          </div>
        ) : (
          <div className="bg-gray-100 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="p-4 font-medium text-gray-700">Rank</th>
                  <th className="p-4 font-medium text-gray-700">Student</th>
                  <th className="p-4 font-medium text-gray-700">Score</th>
                  <th className="p-4 font-medium text-gray-700">Questions Solved</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {leaderboard.map((student) => (
                  <tr key={student.studentId} className="border-b border-gray-300 last:border-b-0 hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-gray-900 mr-2">#{student.rank}</span>
                        {student.rank === 1 && <span className="text-yellow-500">🏆</span>}
                        {student.rank === 2 && <span className="text-gray-400">🥈</span>}
                        {student.rank === 3 && <span className="text-amber-600">🥉</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-semibold text-gray-900">{student.studentName}</div>
                        <div className="text-sm text-gray-600">{student.studentEmail}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-lg font-bold text-blue-600">{student.totalScore}</span>
                    </td>
                    <td className="p-4 ">
                      <span className="w-full font-medium text-gray-900">{student.questionsSolved}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;