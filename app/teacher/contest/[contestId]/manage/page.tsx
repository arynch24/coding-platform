"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Edit, Users, Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Loader from "@/components/Loader";
import Error from "@/components/ErrorBox";
import ProblemCard from "@/components/ContestProblemCard";

// Tag Component
const Tag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="bg-gray-300 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
        {children}
    </span>
);

// Types from API
interface Problem {
    id: string;
    title: string;
    difficulty: "Easy" | "Medium" | "Hard";
    points: number;
}

interface ContestData {
    problems: Array<{
        id: string;
        problem: Problem;
    }>;
    batchContests: { id: string; name: string }[];
    contestModerators: { id: string; name: string; email: string }[];
    tags: { id: string; name: string }[];
    allowedLanguages: { id: string; name: string }[];
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    subject: { name: string; id: string } | null;
    participants: number;
}

const DataStructureSprint: React.FC = () => {
    const router = useRouter();
    const [contestData, setContestData] = useState<ContestData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Extract contestId from URL path
    const path = useSearchParams();
    const fullPath = typeof window !== "undefined" ? window.location.pathname : "";
    const contestId = fullPath.split("/")[3]; // /teacher/contest/[id]/manage → [3]


    useEffect(() => {
        const timer = setInterval(() => {
            // force re-render to update time
            setContestData((prev) => prev);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!contestId) {
            setError("Contest ID not found in URL.");
            setIsLoading(false);
            return;
        }

        const fetchContestData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/contests/problem/${contestId}`, {
                    withCredentials: true
                });
                setContestData(res.data.data);
            } catch (err: any) {
                setError(err.response?.data?.message || "Failed to load contest data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchContestData();
    }, [contestId]);

    // Time Remaining Calculation
    const getTimeRemaining = (): string => {
        if (!contestData) return "--:--:--";

        const now = new Date();
        const start = new Date(contestData.startTime);
        const end = new Date(contestData.endTime);

        if (now < start) {
            return formatTimeDiff(start.getTime() - now.getTime());
        } else if (now >= start && now <= end) {
            return formatTimeDiff(end.getTime() - now.getTime());
        } else {
            return "Contest Ended";
        }
    };

    const formatTimeDiff = (ms: number): string => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((ms % (1000 * 60)) / 1000);
        return `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    // Determine if contest is editable (upcoming or live)
    const isEditable = () => {
        if (!contestData) return false;
        const now = new Date();
        const start = new Date(contestData.startTime);
        const end = new Date(contestData.endTime);
        return now < end; // editable if contest hasn't ended
    };

    const totalScore = contestData?.problems.reduce(
        (sum, p) => sum + p.problem.points,
        0
    ) || 0;

    const batches = contestData?.batchContests.map((b) => b.name).join(", ") || "-";
    const subject = contestData?.subject?.name || "Unknown";
    const moderatorsCount = contestData?.contestModerators.length || 0;

    const handleBackClick = () => router.back();
    const handleEditContest = () => {
        if (contestId) {
            router.push(`/teacher/contest/${contestId}/edit`);
        }
    };
    const handleAddQuestion = () => {
        router.push(`/teacher/contest/${contestId}/manage/select`);
    };
    
    const handleModerators = () => {
        router.push(`/teacher/contest/${contestId}/moderators`);
    };
    const handleProblemClick = (problemId: string) => {
        router.push(`/question/${problemId}`);
    };
    const handleEditProblem = (problemId: string) => {
        router.push(`/teacher/problem/${problemId}/edit`);
    };

    if (isLoading) return <Loader text="Loading Contest Dashboard..." />;
    if (error) return <Error message={error} onRetry={() => window.location.reload()} />;
    if (!contestData) return <Error message="No contest data found." onRetry={() => window.location.reload()} />;

    const contestStatus = (() => {
        const now = new Date();
        const start = new Date(contestData.startTime);
        const end = new Date(contestData.endTime);
        if (now < start) return "Upcoming";
        if (now >= start && now <= end) return "Live";
        return "Ended";
    })();

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleBackClick}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 text-gray-600" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-4xl font-bold text-gray-900">{contestData.title}</h1>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${contestStatus === "Upcoming" ? "bg-blue-100 text-blue-800" :
                                    contestStatus === "Live" ? "bg-green-100 text-green-800" :
                                        "bg-gray-100 text-gray-800"
                                    }`}>
                                    {contestStatus}
                                </span>
                            </div>
                            <p className="text-gray-600 mt-2">{contestData.description}</p>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="text-4xl font-bold text-gray-900 mb-1">{getTimeRemaining()}</div>
                        <div className="text-gray-600 text-sm">Time remaining</div>
                    </div>
                </div>

                {/* Info Row */}
                <div className="flex items-center justify-between mb-8 text-gray-900">
                    <div className="flex items-center space-x-6">
                        <span>
                            {new Date(contestData.startTime).toLocaleDateString()} •{" "}
                            {new Date(contestData.startTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}{" "}–{" "}
                            {new Date(contestData.endTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </span>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 bg-qc-dark px-4 py-2 rounded-lg">
                            <Users className="w-4 h-4 text-gray-200" />
                            <span className="font-medium text-gray-100">{contestData.participants || 0}</span>
                        </div>
                        <button
                            onClick={handleModerators}
                            className="flex items-center space-x-2 bg-qc-dark hover:bg-qc-dark/90 text-white px-4 py-2 rounded-lg"
                        >
                            <Users className="w-4 h-4" />
                            <span>Moderators ({moderatorsCount})</span>
                        </button>

                        {/* Edit Contest Button (only if editable) */}
                        {isEditable() && (
                            <button
                                onClick={handleEditContest}
                                className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                            >
                                <Edit className="w-4 h-4" />
                                <span>Edit Contest</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Tags & Stats */}
                <div className="flex items-center space-x-6 mb-8">
                    <div className="flex items-center space-x-2">
                        <span className="text-gray-600">Batches:</span>
                        <Tag>{batches}</Tag>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-gray-600">Subject:</span>
                        <Tag>{subject}</Tag>
                    </div>

                    <div className="ml-auto text-right">
                        <div className="text-gray-900 font-bold text-lg">Total Score: {totalScore}</div>
                    </div>
                </div>

                {/* Problems Section */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Problems</h2>
                            <p className="text-gray-600">Click to view or edit problems</p>
                        </div>

                        {/* Add Question Button */}
                        {isEditable() && (
                            <button
                                onClick={handleAddQuestion}
                                className="flex items-center space-x-2 bg-qc-dark hover:bg-qc-dark/90 text-white px-4 py-2 rounded-lg"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add Question</span>
                            </button>
                        )}
                    </div>

                    <div className="space-y-3">
                        {contestData.problems.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No problems added yet.</p>
                        ) : (
                            contestData.problems.map((item) => (
                                <ProblemCard
                                    key={item.id}
                                    number={item.problem.id === "string" ? parseInt(item.id) || 1 : 1}
                                    title={item.problem.title}
                                    points={item.problem.points}
                                    difficulty={item.problem.difficulty}
                                    onClick={() => handleProblemClick(item.problem.id)}
                                    onEdit={isEditable() ? () => handleEditProblem(item.problem.id) : undefined}
                                    role="teacher"
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataStructureSprint;