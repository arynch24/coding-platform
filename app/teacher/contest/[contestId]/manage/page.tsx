"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, Edit, Users, Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Loader from "@/components/Loader";
import Error from "@/components/ErrorBox";
import ProblemCard from "@/components/ContestProblemCard";
import ModeratorDialog from "@/components/ModeratorDialog";
import { formatDate } from "@/lib/utils/formatDateTime";
import { toast } from "sonner";

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
    difficulty: "Easy" | "Medium" | "Hard"
}

interface ContestData {
    problems: Array<{
        id: string;
        point: number;
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

const ContestManagement: React.FC = () => {
    const router = useRouter();
    const [contestData, setContestData] = useState<ContestData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isModeratorDialogOpen, setIsModeratorDialogOpen] = useState(false);

    // Extract contestId from URL path
    const path = useSearchParams();
    const fullPath = typeof window !== "undefined" ? window.location.pathname : "";
    const contestId = fullPath.split("/")[3]; // /teacher/contest/[id]/manage → [3]

    const [timeRemaining, setTimeRemaining] = useState<string>("--:--:--");

    useEffect(() => {
        if (!contestData) {
            setTimeRemaining("--:--:--");
            return;
        }

        const updateTime = () => {
            const now = new Date();
            const start = new Date(contestData.startTime);
            const end = new Date(contestData.endTime);

            let remainingTime: string;

            if (now < start) {
                remainingTime = formatTimeDiff(start.getTime() - now.getTime());
            } else if (now <= end) {
                remainingTime = formatTimeDiff(end.getTime() - now.getTime());
            } else {
                remainingTime = "Contest Ended";
            }

            setTimeRemaining(remainingTime);

            // Return `true` if timer should continue
            return now <= end;
        };

        // Initial call
        const shouldContinue = updateTime();

        if (!shouldContinue) return; // Stop if contest ended

        const timer = setInterval(updateTime, 1000);
        return () => clearInterval(timer);
    }, [contestData]);


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

    const formatTimeDiff = (ms: number): string => {
        if (ms <= 0) return "00:00:00";
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
        (sum, p) => sum + p.point,
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
        setIsModeratorDialogOpen(true);
    };

    const handleProblemClick = (problemId: string) => {
        router.push(`/problems/${problemId}`);
    };
    const handleEditProblem = (problemId: string) => {
        router.push(`/teacher/questions/${problemId}`);
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

    // Update points of a problem in contest
    const handleUpdatePoints = async (contestProblemId: string, newPoints: number) => {
        try {
            const res = await axios.patch(
                `${process.env.NEXT_PUBLIC_API_URL}/contests/problem/${contestProblemId}`,
                {
                    point: newPoints,
                    contestId
                },
                { withCredentials: true }
            );

            const updatedPoint = res.data.data.updatedProblem.point;

            // Update local state
            setContestData((prev) =>
                prev
                    ? {
                        ...prev,
                        problems: prev.problems.map((p) =>
                            p.id === contestProblemId ? { ...p, point: updatedPoint } : p
                        ),
                    }
                    : prev
            );

            toast.success("Points updated!");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update points");
            throw err; // Re-throw for caller to handle if needed
        }
    };

    // Remove problem from contest
    const handleRemoveProblem = async (contestProblemId: string) => {
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/contests/problem/${contestProblemId}`, {
                withCredentials: true,
            });
            setContestData((prev) =>
                prev
                    ? {
                        ...prev,
                        problems: prev.problems.filter((p) => p.id !== contestProblemId),
                    }
                    : prev
            );
            toast.success("Problem removed from contest");
            return true;
        } catch (err: any) {
            // Rollback on error
            const errorMessage = err.response?.data?.message || "Failed to remove problem";
            toast.error(errorMessage);
            return false;
        }
    };

    return (
        <div className="px-10 h-full py-3">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={handleBackClick}
                    className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors flex items-center gap-1 mb-3 cursor-pointer"
                >
                    <ChevronLeft size={16} className=" text-gray-600" />
                    Back
                </button>
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center space-x-4">
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
                        <div className="text-4xl font-bold text-gray-900 mb-1">{timeRemaining}</div>
                        <div className="text-gray-600 text-sm">Time remaining</div>
                    </div>
                </div>

                {/* Info Row */}
                <div className="flex items-center justify-between mb-8 text-gray-900">
                    <div className="flex items-center space-x-6">
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-600">Date</span>
                            <span className="font-medium">
                                {formatDate(new Date(contestData.startTime), "short")}
                            </span>
                        </div>

                        <div className="flex flex-col">
                            <span className="text-sm text-gray-600">Time</span>
                            <span className="font-medium">
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
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* <div className="flex items-center space-x-2 bg-qc-dark px-4 py-2 rounded-lg">
                            <Users className="w-4 h-4 text-gray-200" />
                            <span className="font-medium text-gray-100">{contestData.participants || 0}</span>
                        </div> */}
                        <button
                            onClick={handleModerators}
                            className="flex items-center space-x-2 bg-qc-dark hover:bg-qc-dark/90 text-white px-4 py-2 rounded-lg"
                        >
                            <Users className="w-4 h-4" />
                            <span>Moderators</span>
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
                <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2 items-center">
                        <span className="text-gray-600">Topics:</span>
                        <span className="text-gray-300 text-sm space-x-3">
                            {contestData.tags.map((tag) => (
                                <Tag key={tag.id}>{tag.name}</Tag>
                            ))}
                        </span>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex ml-auto  items-center space-x-2">
                            <span className="text-gray-600">Batches:</span>
                            <Tag>{batches}</Tag>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-gray-600">Subject:</span>
                            <Tag>{subject}</Tag>
                        </div>
                    </div>
                </div>



                {/* Problems Section */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Problems</h2>
                            <p className="text-gray-600">Click to view or edit problems</p>
                        </div>

                        <div className="flex gap-3 items-center">
                            <div className="text-right border border-gray-200 rounded-lg px-3 py-1 bg-gray-100">
                                <div className="text-gray-900 font-semibold text-lg">Total Score: {totalScore}</div>
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
                    </div>

                    <div className="space-y-3">
                        {contestData.problems.map((item, index) => (
                            <ProblemCard
                                key={item.id}
                                number={index + 1}
                                title={item.problem.title}
                                points={item.point}
                                difficulty={item.problem.difficulty}
                                onClick={() => handleProblemClick(item.problem.id)}
                                onEdit={isEditable() ? () => handleEditProblem(item.problem.id) : undefined}
                                role="teacher"
                                contestProblemId={item.id}
                                // Pass functions (not API calls)
                                onUpdatePoints={handleUpdatePoints}
                                onRemove={handleRemoveProblem}
                            />
                        ))}
                    </div>
                </div>
            </div>
            {isModeratorDialogOpen && contestId && (
                <ModeratorDialog
                    contestId={contestId}
                    isOpen={isModeratorDialogOpen}
                    onClose={() => setIsModeratorDialogOpen(false)}
                />
            )}
        </div>
    );
};

export default ContestManagement;