"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, FileText, CheckCircle } from 'lucide-react';
import StatCard from '@/components/StatCard';
import FeedbackModal from '@/components/FeedBackModal';
import FilterDropdown from '@/components/FilterDropdown';
import ExamTable from '@/components/LeaderboardTable';
import { ExamResult } from '@/types/dashboard';
import Loader from '@/components/Loader';
import Error from '@/components/ErrorBox';

interface OverallStats {
    currentRank: number;
    totalExams: number;
    totalQuestionsSolved: number;
}

interface DashboardData {
    overallStats: OverallStats;
    examResults: ExamResult[];
    subjects: string[];
}

// Mock data that will be returned by the API call
const mockApiResponse: DashboardData = {
    overallStats: {
        currentRank: 21,
        totalExams: 10,
        totalQuestionsSolved: 23
    },
    examResults: [
        {
            id: '1',
            examName: 'Algorithm Mastery Contest',
            subject: 'Data Structures and Algorithm',
            dateTime: '07/08/2025, 11:30:20',
            score: 250,
            rank: 42,
            finalScore: 220,
            finalRank: 52,
            solved: 4,
            total: 9,
            feedback: 'Good performance on basic algorithms. Focus more on dynamic programming and graph algorithms for better results. Time management needs improvement.'
        },
        {
            id: '2',
            examName: 'Algorithm Mastery Contest',
            subject: 'Data Structures and Algorithm',
            dateTime: '07/08/2025, 11:30:20',
            score: 250,
            rank: 42,
            finalScore: 220,
            finalRank: 52,
            solved: 4,
            total: 9,
            feedback: 'Excellent understanding of tree traversal algorithms. Work on optimization techniques and space complexity analysis.'
        },
        {
            id: '3',
            examName: 'Algorithm Mastery Contest',
            subject: 'Advanced JAVA',
            dateTime: '07/08/2025, 11:30:20',
            score: 250,
            rank: 42,
            finalScore: 220,
            finalRank: 52,
            solved: 4,
            total: 9,
            feedback: 'Strong grasp of Java fundamentals. Improve knowledge of Java 8+ features, streams, and concurrent programming concepts.'
        }
    ],
    subjects: ['All subjects', 'Data Structures and Algorithm', 'Advanced JAVA']
};

const LeaderboardDashboard: React.FC = () => {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSubject, setSelectedSubject] = useState('All subjects');
    const [feedbackModal, setFeedbackModal] = useState<{
        feedback: string;
        position: { x: number; y: number };
    } | null>(null);

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Simulate axios API call
            //   const response = await axios.get('/api/leaderboard-dashboard', {
            //     timeout: 10000,
            //   });

            // In a real scenario, you'd use response.data
            // For this mock, we'll use our mock data
            const data = mockApiResponse;

            setDashboardData(data);
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
            setError('Failed to load dashboard data. Please try again.');
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

    // If no data is available
    if (!dashboardData) {
        return <Error message="No data available" onRetry={fetchDashboardData} />;
    }

    // Filter results based on selected subject
    const filteredResults = dashboardData.examResults.filter(result =>
        selectedSubject === 'All subjects' || result.subject === selectedSubject
    );

    // Group results by subject
    const resultsBySubject = filteredResults.reduce((acc, result) => {
        if (!acc[result.subject]) {
            acc[result.subject] = [];
        }
        acc[result.subject].push(result);
        return acc;
    }, {} as Record<string, ExamResult[]>);

    const handleFeedbackClick = (feedback: string, event: React.MouseEvent) => {
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        setFeedbackModal({
            feedback,
            position: {
                x: rect.left + rect.width / 2,
                y: rect.top
            }
        });
    };

    const closeFeedbackModal = () => {
        setFeedbackModal(null);
    };

    return (
        <div className="max-w-7xl mx-auto p-6 bg-white min-h-screen">
            {/* Overall Leaderboard Section */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Overall Leaderboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <StatCard
                        icon={<Trophy size={20} />}
                        title="Current Rank"
                        value={`#${dashboardData.overallStats.currentRank}`}
                        bgColor="bg-qc-dark"
                    />
                    <StatCard
                        icon={<FileText size={20} />}
                        title="Total Exams"
                        value={dashboardData.overallStats.totalExams}
                        bgColor="bg-qc-dark"
                    />
                    <StatCard
                        icon={<CheckCircle size={20} />}
                        title="Total Qns. Solved"
                        value={dashboardData.overallStats.totalQuestionsSolved}
                        bgColor="bg-qc-dark"
                    />
                </div>
            </div>

            {/* Past Exam Leaderboards Section */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Past exam leaderboards</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Filter:</span>
                        <FilterDropdown
                            options={dashboardData.subjects}
                            selected={selectedSubject}
                            onSelect={setSelectedSubject}
                            placeholder="All subjects"
                        />
                    </div>
                </div>

                {Object.entries(resultsBySubject).map(([subject, results]) => (
                    <div key={subject} className="mb-8">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">{subject}</h3>
                        <ExamTable
                            results={results}
                            onFeedbackClick={handleFeedbackClick}
                        />
                    </div>
                ))}

                {filteredResults.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                        <p>No exam results found for the selected filter.</p>
                    </div>
                )}
            </div>

            {/* Feedback Modal */}
            {feedbackModal && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={closeFeedbackModal}
                    />
                    <FeedbackModal
                        feedback={feedbackModal.feedback}
                        onClose={closeFeedbackModal}
                        position={feedbackModal.position}
                    />
                </>
            )}
        </div>
    );
};

export default LeaderboardDashboard;