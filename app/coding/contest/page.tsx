"use client";

import React from 'react';
import { Trophy, Users, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface StatsCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}

interface Problem {
  id: number;
  title: string;
  points: number;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  solved: string;
  score: number;
}

interface SprintData {
  timeRemaining: string;
  currentRank: number;
  participants: number;
  currentScore: number;
  solvedProblems: string;
  totalScore: number;
  problems: Problem[];
  leaderboard: LeaderboardEntry[];
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, value, label }) => (
  <div className="bg-qc-dark rounded-lg p-4 text-white">
    <div className="flex items-center justify-center mb-2">
      {icon}
    </div>
    <div className="text-2xl font-bold text-center">{value}</div>
    <div className="text-sm text-center text-slate-300">{label}</div>
  </div>
);

const ProblemCard: React.FC<{ problem: Problem, handleQuestion: () => void }> = ({ problem, handleQuestion }) => {


  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleQuestion}>
      <div className="flex justify-between items-center">
        <span className="text-gray-800 font-medium">{problem.id}. {problem.title}</span>
        <span className="text-gray-600 font-semibold">{problem.points} points</span>
      </div>
    </div>
  )
};

const LeaderboardRow: React.FC<{ entry: LeaderboardEntry }> = ({ entry }) => (
  <div className="flex justify-between items-center py-3 px-4 border-b border-gray-200 last:border-b-0">
    <div className="flex items-center gap-3">
      <span className="text-gray-600 font-medium">{entry.rank}.</span>
      <span className="text-gray-800">{entry.name}</span>
    </div>
    <div className="flex items-center gap-4">
      <span className="text-gray-600">{entry.solved}</span>
      <span className="font-semibold text-gray-800">{entry.score}</span>
    </div>
  </div>
);

const DataStructureSprint: React.FC = () => {
  // Mock data - this would come from API
  const sprintData: SprintData = {
    timeRemaining: "02:00:00",
    currentRank: 21,
    participants: 231,
    currentScore: 167,
    solvedProblems: "5/9",
    totalScore: 300,
    problems: [
      { id: 1, title: "Palindrome Numbers", points: 50 },
      { id: 2, title: "Jump Game I", points: 50 },
      { id: 3, title: "Reverse Array", points: 50 },
      { id: 4, title: "Fruits Into Basket III", points: 50 },
      { id: 5, title: "Longest Palindrome String", points: 50 },
      { id: 6, title: "Median Of Two Sorted Array", points: 50 },
    ],
    leaderboard: [
      { rank: 1, name: "Ram Ramesh", solved: "5/6", score: 250 },
      { rank: 2, name: "Sham Raghav", solved: "5/6", score: 250 },
      { rank: 3, name: "Manu Manik", solved: "5/6", score: 250 },
      { rank: 4, name: "Shoyeb Ansari", solved: "5/6", score: 250 },
      { rank: 5, name: "Jivan Jamdar", solved: "5/6", score: 250 },
      { rank: 6, name: "Aryan Chauhan", solved: "5/6", score: 250 },
      { rank: 7, name: "Rohit Makani", solved: "5/6", score: 250 },
      { rank: 8, name: "Arjun Mishra", solved: "5/6", score: 250 },
      { rank: 9, name: "Ankit Raj", solved: "5/6", score: 250 },
      { rank: 10, name: "Anuj Kumar", solved: "5/6", score: 250 },
      { rank: 11, name: "Ashutosh Rai", solved: "5/6", score: 250 },
    ]
  };

  const router = useRouter();

  const handleQuestion = () => {
    // Handle question click logic here
    router.push('/question');
  }


  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Data Structure Sprint</h1>
            <p className="text-gray-600">Test your algorithmic skills with dynamic programming and graph problems.</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{sprintData.timeRemaining}</div>
            <div className="text-gray-600">Time remaining</div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatsCard
            icon={<Trophy className="h-8 w-8" />}
            value={`#${sprintData.currentRank}`}
            label="Current rank"
          />
          <StatsCard
            icon={<Users className="h-8 w-8" />}
            value={sprintData.participants}
            label="Participants"
          />
          <StatsCard
            icon={<Award className="h-8 w-8" />}
            value={sprintData.currentScore}
            label="Current score"
          />
          <StatsCard
            icon={<Award className="h-8 w-8" />}
            value={sprintData.solvedProblems}
            label="Solved Qns."
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Problems Section */}
          <div className="lg:col-span-2 bg-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Problems</h2>
              <span className="text-gray-600">Total score: {sprintData.totalScore}</span>
            </div>
            <p className="text-gray-600 mb-6">Click on a problem to start solving</p>
            <div className="space-y-4">
              {sprintData.problems.map((problem) => (
                <ProblemCard key={problem.id} problem={problem}
                  handleQuestion={handleQuestion}
                />
              ))}
            </div>
          </div>

          {/* Leaderboard Section */}
          <div className="bg-gray-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Leader board</h2>
            <p className="text-gray-600 mb-6">Top participants in this exam</p>
            <div className="bg-white rounded-lg overflow-hidden" style={{ maxHeight: 'calc(100vh - 300px)' }}>
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
                {sprintData.leaderboard.map((entry) => (
                  <LeaderboardRow key={entry.rank} entry={entry} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataStructureSprint;