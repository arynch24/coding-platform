"use client";

import { useState, useEffect } from 'react';
import { Student } from '@/types/dashboard';
import Badge from '@/components/ui/Badge';
import Button from '@/components/Button';

interface ContestData {
    title: string;
    subtitle: string;
    duration: string;
    dateTime: string;
    instructor: string;
    batch: string;
    subject: string;
    participants: number;
}


interface ErrorMessageProps {
    message: string;
    onRetry: () => void;
}

// Loading Spinner Component
const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
);

// Error Message Component
const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => (
    <div className="text-center py-8">
        <p className="text-red-600 mb-4">{message}</p>
        <Button onClick={onRetry} variant="primary">Retry</Button>
    </div>
);

const LeaderboardPage: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Mock contest data
    const contestData: ContestData = {
        title: 'DSA Sprint Exam #1',
        subtitle: 'Data structures and algorithms - Arrays & Strings',
        duration: '02:00:00',
        dateTime: '7/30/2025, 11:30:30',
        instructor: 'Satya sir',
        batch: 'SOTB1',
        subject: 'DSA',
        participants: 120
    };

    // Mock API call to fetch leaderboard data
    const fetchLeaderboardData = async (): Promise<void> => {
        try {
            setLoading(true);
            setError(null);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            const mockStudents: Student[] = [
                {
                    id: '1',
                    rank: 1,
                    name: 'Ram Ramesh',
                    email: 'ram.sot0043@pwiol.com',
                    obtainedScore: 250,
                    solvedQuestions: '5/9'
                },
                {
                    id: '2',
                    rank: 2,
                    name: 'Purnand Ware',
                    email: 'purnand.sot0044@pwlol.com',
                    obtainedScore: 241,
                    solvedQuestions: '4/9'
                },
                {
                    id: '3',
                    rank: 3,
                    name: 'Arjun Mishra',
                    email: 'arjun.sot0045@pwlol.com',
                    obtainedScore: 210,
                    solvedQuestions: '3/9'
                },
                {
                    id: '4',
                    rank: 4,
                    name: 'Ayush Gautam',
                    email: 'ayush.sot0046@pwlol.com',
                    obtainedScore: 200,
                    solvedQuestions: '2/9'
                },
                {
                    id: '5',
                    rank: 5,
                    name: 'Priya Sharma',
                    email: 'priya.sot0047@pwlol.com',
                    obtainedScore: 195,
                    solvedQuestions: '2/9'
                },
                {
                    id: '6',
                    rank: 6,
                    name: 'Rohit Kumar',
                    email: 'rohit.sot0048@pwlol.com',
                    obtainedScore: 180,
                    solvedQuestions: '2/9'
                }
            ];

            setStudents(mockStudents);
        } catch (err) {
            setError('Failed to load leaderboard data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaderboardData();
    }, []);

    const handleRetry = (): void => {
        fetchLeaderboardData();
    };

    const getRankIcon = (rank: number): string => {
        switch (rank) {
            case 1:
                return '🏆';
            case 2:
                return '🥈';
            case 3:
                return '🥉';
            default:
                return '';
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {contestData.title} - Leaderboard
                    </h1>
                    <p className="text-gray-600 mb-2">{contestData.subtitle}</p>
                    
                    {/* Badges Section */}
                    <div className="flex gap-4 items-center mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Batches:</span>
                            <Badge variant="default">{contestData.batch}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Subject:</span>
                            <Badge variant="default">{contestData.subject}</Badge>
                        </div>
                    </div>
                    
                    <div className="flex gap-4 text-sm text-gray-500">
                        <span>📅 {contestData.dateTime}</span>
                        <span>👥 {contestData.participants} participants</span>
                        <span>👨‍🏫 By {contestData.instructor}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <div className="text-4xl font-bold text-gray-900 mb-1">
                            {contestData.duration}
                        </div>
                        <div className="text-gray-600 text-sm">Time remaining</div>
                    </div>
                </div>
            </div>

            {/* Content */}
            {loading && <LoadingSpinner />}

            {error && (
                <ErrorMessage message={error} onRetry={handleRetry} />
            )}

            {!loading && !error && students.length > 0 && (
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
                            {students.map((student: Student) => (
                                <tr key={student.id} className="border-b border-gray-300 last:border-b-0">
                                    <td className="p-4">
                                        <div className="flex items-center">
                                            <span className="text-lg font-bold text-gray-900 mr-2">
                                                #{student.rank}
                                            </span>
                                            {getRankIcon(student.rank) && (
                                                <span className={
                                                    student.rank === 1 ? 'text-yellow-500' :
                                                    student.rank === 2 ? 'text-gray-400' :
                                                    'text-yellow-600'
                                                }>
                                                    {getRankIcon(student.rank)}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div>
                                            <div className="font-semibold text-gray-900">
                                                {student.name}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {student.email}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-lg font-bold text-blue-600">
                                            {student.obtainedScore}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-medium text-gray-900">
                                            {student.solvedQuestions}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && !error && students.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-gray-600">No students found for this exam.</p>
                </div>
            )}
        </div>
    );
};

export default LeaderboardPage;