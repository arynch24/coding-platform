"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Loader from '@/components/Loader';
import Error from '@/components/ErrorBox';
import Badge from '@/components/ui/Badge';

// Define types
interface Contest {
    id: string;
    title: string;
    description: string;
    startTime: string | Date;
    endTime: string | Date;
    isPublished: boolean;
    participants: number;
}

const ExamManagementPage: React.FC = () => {
    const [contests, setContests] = useState<Contest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

    // Format date to "MMM DD, YYYY - HH:MM AM/PM"
    const formatDateTime = (date: string | Date): string => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const fetchPastContests = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/contests/past`, {
                withCredentials: true,
            });

            // Assuming API returns { data: { contests: [...] } }
            const fetchedContests: Contest[] = res.data.data.contests;
            setContests(fetchedContests);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load past contests.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPastContests();
    }, []);

    if (isLoading) {
        return <Loader text="Loading Past Contests..." />;
    }

    if (error) {
        return <Error message={error} onRetry={fetchPastContests} />;
    }

    const totalExams = contests.length;

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Past Contests</h1>
                    <p className="text-gray-600">Manage and view results of previously conducted contests.</p>
                </div>
                <div className="text-right">
                    <div className="text-sm text-gray-600 mb-1">Total exams:</div>
                    <div className="border border-gray-300 rounded px-4 py-2 bg-gray-50 font-medium">
                        {totalExams}
                    </div>
                </div>
            </div>

            {/* Contests Table */}
            <div className="bg-gray-100 rounded-lg overflow-hidden">
                <table className="w-full border border-gray-200">
                    <thead>
                        <tr className="bg-gray-200 text-left">
                            <th className="p-4 font-medium text-gray-700">Exam</th>
                            <th className="p-4 font-medium text-gray-700">Date & Timing</th>
                            <th className="p-4 font-medium text-gray-700">Participants</th>
                            <th className="p-4 font-medium text-gray-700">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {contests.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-4 text-center text-gray-500">
                                    No past contests found.
                                </td>
                            </tr>
                        ) : (
                            contests.map((exam) => (
                                <tr
                                    key={exam.id}
                                    className="border-t border-gray-200 hover:bg-gray-50 cursor-pointer"
                                    onClick={() => router.push(`/teacher/leaderboard/${exam.id}`)}
                                >
                                    <td className="p-4">
                                        <div>
                                            <div className="font-semibold text-gray-900">{exam.title}</div>
                                            <div className="text-sm text-gray-600">{exam.description}</div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-700">{formatDateTime(exam.startTime)}</td>
                                    <td className="p-4">
                                        <div className="bg-white border border-gray-300 rounded px-3 py-1 text-center inline-block min-w-[60px]">
                                            {exam.participants}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {exam.isPublished ? (
                                            <Badge>Published</Badge>
                                        ) : (
                                            <Badge variant="secondary">Unpublished</Badge>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ExamManagementPage;