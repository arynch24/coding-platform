"use client";

import { useState, useEffect } from 'react';
import { Exam } from '@/types/dashboard';
import Badge from '@/components/Badge';
import { useRouter } from 'next/navigation';
import Loader from '@/components/Loader';
import Error from '@/components/ErrorBox';

// Mock API function
const fetchExamsData = async (): Promise<Exam[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate potential API error (uncomment to test error handling)
    // if (Math.random() > 0.8) {
    //   throw new Error('Failed to fetch exams data');
    // }

    // Mock data
    return [
        {
            id: '1',
            title: 'Mathematics Midterm',
            description: 'Comprehensive math exam covering algebra and geometry',
            dateTime: 'Dec 15, 2024 - 10:00 AM',
            participants: 45,
            status: 'Published'
        },
        {
            id: '2',
            title: 'Physics Final',
            description: 'Final examination for Physics 101',
            dateTime: 'Dec 20, 2024 - 2:00 PM',
            participants: 32,
            status: 'Unpublished'
        },
        {
            id: '3',
            title: 'Chemistry Quiz',
            description: 'Weekly chemistry assessment',
            dateTime: 'Dec 18, 2024 - 11:00 AM',
            participants: 28,
            status: 'Published'
        },
        {
            id: '4',
            title: 'Biology Lab Test',
            description: 'Practical examination for biology lab',
            dateTime: 'Dec 22, 2024 - 9:00 AM',
            participants: 0,
            status: 'Unpublished'
        },
        {
            id: '5',
            title: 'English Literature Essay',
            description: 'Analytical essay on modern literature',
            dateTime: 'Dec 25, 2024 - 1:00 PM',
            participants: 38,
            status: 'Published'
        }
    ];
};

// Main component
const ExamManagementPage: React.FC = () => {
    const [exams, setExams] = useState<Exam[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const examsData = await fetchExamsData();
            setExams(examsData);
        } catch (err) {
            setError('An error occurred while fetching data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const router = useRouter();

    // Show loading spinner while fetching data
    if (isLoading) {
        return <Loader text="Loading Leaderboard" />;
    }

    // Show error message if there's an error
    if (error) {
        return <Error message={error} onRetry={fetchDashboardData} />;
    }

    const totalExams = exams.length;

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Student Leaderboard and Management</h1>
                </div>
                <div className="text-right">
                    <div className="text-sm text-gray-600 mb-1">Total exams:</div>
                    <div className="border border-gray-300 rounded px-4 py-2 bg-gray-50 font-medium">
                        {totalExams}
                    </div>
                </div>
            </div>

            {/* Exams Table */}
            <div className="bg-gray-100 rounded-lg overflow-hidden">
                <table className="w-full border border-gray-200">
                    <thead>
                        <tr className="bg-gray-200 text-left">
                            <th className="p-4 font-medium text-gray-700">Exam</th>
                            <th className="p-4 font-medium text-gray-700">Date & timing</th>
                            <th className="p-4 font-medium text-gray-700">Participants</th>
                            <th className="p-4 font-medium text-gray-700">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {exams.map((exam) => (
                            <tr key={exam.id} className="border border-gray-200 last:border-b-0 cursor-pointer hover:bg-gray-50"
                                onClick={() => router.push(`/teacher/leaderboard/contest-id`)}
                            >
                                <td className="p-4">
                                    <div>
                                        <div className="font-semibold text-gray-900">{exam.title}</div>
                                        <div className="text-sm text-gray-600">{exam.description}</div>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-700">{exam.dateTime}</td>
                                <td className="p-4">
                                    <div className="bg-white border border-gray-300 rounded px-3 py-1 text-center inline-block min-w-[60px]">
                                        {exam.participants}
                                    </div>
                                </td>
                                <td className="p-4">
                                    {exam.status === 'Published' ? (
                                        <Badge>Published</Badge>
                                    ) : (
                                        <Badge variant="secondary">Unpublished</Badge>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ExamManagementPage;