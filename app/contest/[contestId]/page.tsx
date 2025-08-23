"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, User } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Loader from "@/components/Loader";
import Error from "@/components/ErrorBox";
import ProblemCard from "@/components/ContestProblemCard";
import { formatDate } from "@/lib/utils/formatDateTime";
import { toast } from "sonner";
import Tag from "@/components/ui/Tag";

// Types from API
interface Problem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard",
  point: number;
  isSolved: boolean;
}

interface ContestData {
  problems: Problem[];
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
  creator: { id: string; name: string; email: string };
}

const StudentContest: React.FC = () => {
  const router = useRouter();
  const [contestData, setContestData] = useState<ContestData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModeratorDialogOpen, setIsModeratorDialogOpen] = useState(false);

  // Extract contestId from URL path
  const path = useSearchParams();
  const fullPath = typeof window !== "undefined" ? window.location.pathname : "";
  const contestId = fullPath.split("/")[2]; // /teacher/contest/[id]/manage → [3]

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

  const totalScore = contestData?.problems.reduce(
    (sum, p) => sum + p.point,
    0
  ) || 0;

  const batches = contestData?.batchContests.map((b) => b.name).join(", ") || "-";
  const subject = contestData?.subject?.name || "Unknown";

  const handleBackClick = () => router.back();

  const handleProblemClick = (problemId: string) => {
    router.push(`/contest/${contestId}/problems/${problemId}`);
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
    <div className="px-10 h-full py-3">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={handleBackClick}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft size={16} />
          Back
        </button>

        {/* Main Card */}
        <div className="my-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex  gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{contestData.title}</h1>
                <p className="text-gray-600 mt-1">{contestData.description}</p>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <User size={14} className="text-gray-400" />
                  <span>by {contestData.creator.name}</span>
                </div>
              </div>
              <div className="mt-1">
                <Tag variant="status">{contestStatus}</Tag>
              </div>
            </div>
            <div className="ml-auto flex flex-col items-center gap-1 text-right">
              <div className=" text-gray-900 mb-1">Time Remaining:</div>
              <div className="bg-gray-100 border border-gray-200 rounded-lg px-4 py-2">
                <span className="font-mono font-bold text-lg text-gray-800">{timeRemaining}</span>
              </div>
            </div>
          </div>

          {/* Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">{formatDate(new Date(contestData.startTime), "short")}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Time</p>
              <p className="font-medium">
                {new Date(contestData.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}{" "}
                –{" "}
                {new Date(contestData.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Topics</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {contestData.tags.map((tag) => (
                  <Tag key={tag.id} variant="topic">{tag.name}</Tag>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Allowed Languages</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {contestData.allowedLanguages.map((lang) => (
                  <Tag key={lang.id} variant="language">{lang.name}</Tag>
                ))}
              </div>
            </div>
          </div>

          {/* Batches & Subject */}
          <div className="flex flex-wrap gap-4 items-center pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Batches:</span>
              <Tag variant="batch">{batches}</Tag>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Subject:</span>
              <Tag variant="subject">{subject}</Tag>
            </div>
          </div>
        </div>

        {/* Problems Section */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Problems</h2>
              <p className="text-gray-600">Click on a problem to start solving</p>
            </div>

            <div className="flex gap-3 items-center">
              <div className="text-right border border-gray-200 rounded-lg px-3 py-1 bg-gray-100">
                <div className="text-gray-900 font-semibold text-lg">Total Score: {totalScore}</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {contestData.problems.map((problem, index) => (
              <ProblemCard
                key={problem.id}
                number={index + 1}
                title={problem.title}
                points={problem.point}
                difficulty={problem.difficulty}
                onClick={() => handleProblemClick(problem.id)}
                role="student"
                contestProblemId={problem.id}
                isSolved={problem.isSolved}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentContest;