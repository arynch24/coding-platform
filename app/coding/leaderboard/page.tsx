"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, FileText, CheckCircle } from 'lucide-react';
import StatCard from '@/components/StatCard';
import FeedbackModal from '@/components/FeedBackModal';
import FilterDropdown from '@/components/FilterDropdown';
import ExamTable from '@/components/student/LeaderboardTable';
import { ExamResult } from '@/types/dashboard';
import Loader from '@/components/Loader';
import Error from '@/components/ErrorBox';

// API Response Types
interface ApiStatsResponse {
    data: {
        statistics: {
            currentRank: number;
            totalExams: number;
            totalQuestionsSolved: number;
            totalScore?: number;
        };
    };
}

interface ApiContestsResponse {
    data: {
        pastContests: any[];
    };
}

// Component Types
interface OverallStats {
    currentRank: number;
    totalExams: number;
    totalQuestionsSolved: number;
    totalScore?: number;
}

interface DashboardData {
    overallStats: OverallStats;
    examResults: ExamResult[];
    subjects: string[];
}

// Utility Functions
const formatDateTime = (dateTime: string | undefined): string => {
    if (!dateTime) return new Date().toLocaleString();
    return new Date(dateTime).toLocaleString();
};

const extractSubjects = (contests: any[]): string[] => {
    const uniqueSubjects = new Set(
        contests
            .map(contest => contest.subject?.name || contest.subject)
            .filter(subject => subject && typeof subject === 'string' && subject.trim() !== '')
    );
    return ['All subjects', ...Array.from(uniqueSubjects)];
};

// Data Transformation Functions
const transformApiStatsToOverallStats = (apiStats: any): OverallStats => ({
    currentRank: Number(apiStats.currentRank || 0),
    totalExams: Number(apiStats.totalExams || 0),
    totalQuestionsSolved: Number(apiStats.totalQuestionsSolved || 0),
    totalScore: apiStats.totalScore ? Number(apiStats.totalScore) : undefined,
});

const transformApiContestToExamResult = (contest: any, index: number): ExamResult => ({
    id: contest.contestId || index.toString(),
    examName: String(contest.title || 'Unnamed Contest'),
    description: String(contest.description || 'No description available'),
    subject: String(contest.subject?.name || 'General'),
    dateTime: formatDateTime(contest.startDate),
    score: Number(contest.finalScore || 0),
    rank: Number(contest.rank || 0),
    finalScore: Number(contest.finalScore || 0),
    finalRank: Number(contest.rank || 0),
    solved: Number(contest.questionsSolved || 0),
    total: Number(contest.totalQuestions || 0),
    maximumPossibleScore: Number(contest.maximumPossibleScore || 0),
    startDate: contest.startDate || '',
    endDate: contest.endDate || '',
    isPublished: Boolean(contest.isPublished),
    feedback: 'No feedback available for this exam.', // Add if you have feedback in API
});

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

            // Fetch both APIs concurrently
            // Fetch both APIs concurrently
            const [pastContestsResponse, statsResponse] = await Promise.all([
                axios.get<ApiContestsResponse>(`${process.env.NEXT_PUBLIC_API_URL}/students/contest/past`, {
                    withCredentials: true,
                    timeout: 10000,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }),
                axios.get<ApiStatsResponse>(`${process.env.NEXT_PUBLIC_API_URL}/students/contest-stats`, {
                    withCredentials: true,
                    timeout: 10000,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })
            ]);

            const apiContests = pastContestsResponse.data.data.pastContests;
            const apiStats = statsResponse.data.data.statistics;

            // Transform data for display
            const overallStats = transformApiStatsToOverallStats(apiStats);
            const examResults = apiContests.map(transformApiContestToExamResult);
            const subjects = extractSubjects(apiContests);

            setDashboardData({
                overallStats,
                examResults,
                subjects,
            });

        } catch (err: any) {
            console.error('Failed to fetch dashboard data:', err);

            if (err.response?.status === 401) {
                setError('Authentication failed. Please log in again.');
            } else if (err.response?.status === 404) {
                setError('API endpoint not found. Please check the server configuration.');
            } else if (err.code === 'ECONNABORTED') {
                setError('Request timeout. Please check your internet connection.');
            } else {
                setError(err.response?.data?.message || 'Failed to load dashboard data. Please try again.');
            }
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