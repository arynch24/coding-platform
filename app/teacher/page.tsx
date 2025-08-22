"use client";

import React, { useState, useEffect } from 'react';
import Loader from '@/components/Loader';
import Error from '@/components/ErrorBox';
import { useRouter } from 'next/navigation';
import UpcomingExamCard from '@/components/UpcomingExamCard';
import PastExamRow from '@/components/PastExamRow';
import { Plus } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner'
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';

// --- Types ---
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
  startTime: string | Date;
  endTime: string | Date;
  tags: ApiTag[];
  allowedLanguages: ApiLanguage[];
}

interface ApiPastContest {
  id: string;
  title: string;
  description: string;
  startTime: string | Date;
  endTime: string | Date;
  tags: ApiTag[];
  allowedLanguages: ApiLanguage[];
  isPublished: boolean;
  participants: number;
}

interface ExamDashboardData {
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
const ExamDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<ExamDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [examToDelete, setExamToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();

  // Fetch data
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const [upcomingRes, pastRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/contests`, { withCredentials: true }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/contests/past`, { withCredentials: true })
      ]);

      setDashboardData({
        upcomingExams: upcomingRes.data.data.contests || [],
        pastExams: pastRes.data.data.contests || []
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
  const handleView = (examId: string) => {
    router.push(`/teacher/contest/${examId}/manage`);
  };

  const handleCreateExam = () => {
    router.push('/teacher/contest/create');
  };

  const handleDeleteConfirm = async () => {
    if (!examToDelete) return;

    try {
      setIsDeleting(true);

      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/contests/${examToDelete.id}`, {
        withCredentials: true,
      });
      toast.success("Contest deleted successfully");
      setIsDeleteDialogOpen(false);
      setExamToDelete(null);
      setDashboardData(prevData => {
        if (!prevData) return null;
        return {
          upcomingExams: prevData.upcomingExams,
          pastExams: prevData.pastExams.filter(exam => exam.id !== examToDelete.id)
        };
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete contest");
      setIsDeleteDialogOpen(false);
      setExamToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setExamToDelete({ id, name });
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) return <Loader text="Loading Exam Dashboard..." />;
  if (error) return <Error message={error} onRetry={fetchDashboardData} />;
  if (!dashboardData) return <Error message="No data available." onRetry={fetchDashboardData} />;

  // Transform data for display
  const upcomingExams = dashboardData.upcomingExams.map(exam => ({
    id: exam.id,
    title: exam.title,
    description: exam.description,
    tags: exam.tags.map(convertApiTagToDisplayTag),
    date: formatDate(exam.startTime),
    time: formatTime(exam.startTime),
    duration: calculateDuration(exam.startTime, exam.endTime),
    live: new Date() >= new Date(exam.startTime) && new Date() <= new Date(exam.endTime),
  }));

  const pastExams = dashboardData.pastExams.map(exam => ({
    id: exam.id,
    title: exam.title,
    description: exam.description,
    date: formatDate(exam.startTime),
    time: formatTime(exam.startTime),
    totalParticipants: exam.participants,
    isPublished: exam.isPublished,
  }));

  return (
    <div className="h-full px-4 py-6">

      {/* <div className='h-[1200px] bg-qc-dark w-1'></div> */}


      {/* Header */}
      <div className="mb-4">
        <div className="flex  justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Upcoming Contests</h2>
          <button
            onClick={handleCreateExam}
            className="bg-qc-dark hover:bg-qc-dark/95 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2"
          >
            <Plus size={20} />
            Create Exam
          </button>
        </div>
      </div>

      {/* Upcoming Exams */}
      <div>
        {upcomingExams.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow">
            <p className="text-gray-600">No upcoming contests. Create one to get started.</p>
            <button
              onClick={handleCreateExam}
              className="mt-4 bg-qc-dark text-white px-6 py-2 rounded"
            >
              Create Exam
            </button>
          </div>
        ) : (
          <div className="flex gap-6 pb-6 scrollbar-hide">
            {upcomingExams.map(exam => (
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

      {/* Past Exams */}
      <div className="mt-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Past Contests</h2>
        {pastExams.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow">
            <p className="text-gray-600">No past contests yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-4 gap-4 p-6 font-semibold text-gray-700">
                <div>Contest Details</div>
                <div className="text-center">Date & Time</div>
                <div className="text-center">Participants</div>
                <div className="text-center">Actions</div>
              </div>
            </div>

            <div>
              {pastExams.map((exam, index) => (
                <PastExamRow
                  key={exam.id}
                  exam={exam}
                  isLast={index === pastExams.length - 1}
                  role="teacher"
                  handleView={() => handleView(exam.id)}
                  handleDelete={() => handleDeleteClick(exam.id, exam.title)}
                />
              ))}
            </div>
          </div>
        )}
      </div>


      {/* Delete Confirmation Dialog */}
      {examToDelete && (
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          title="Delete Exam?"
          message="Are you sure you want to delete '{item}'? All student data and submissions will be permanently lost."
          itemName={examToDelete.name}
          confirmLabel="Delete Exam"
          cancelLabel="Keep"
          isDeleting={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setIsDeleteDialogOpen(false);
            setExamToDelete(null);
          }}
        />
      )}
    </div>
  );
};

export default ExamDashboard;