/**
 * Interface for user profile data
 */
export interface UserProfile {
    name: string;
    id: string;
    team: string;
    role: string;
    email: string;
    manager?: string;
}

/**
 * Props interface for StickyHeader component
 */
export interface StickyHeaderProps {
    profile: UserProfile;
    header?: string;
}

/**
 * Props interface for ProfileCard component
 */
export interface ProfileCardProps {
    profile: UserProfile;
    isOpen: boolean;
    onClose: () => void;
}

/**
* Interface for individual person data displayed in the UI
*/
export interface PersonData {
    id: string;
    name: string;
    role: string;
    callCount: number;
    messageCount?: number;
    email?: string;
    isActive: boolean;
}


export interface PastExam {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    rank: number;
    solved: string;
    totalProblems: number;
}

export interface UpcomingExam {
    id: string;
    title: string;
    description: string;
    tags: ExamTag[];
    date: string;
    time: string;
    duration: string;
    live:boolean
    teacher: string;
}

export interface ExamTag {
    name: string;
    color: string;
}


export interface StatsCardProps {
    icon: React.ReactNode;
    value: string | number;
    label: string;
}

export interface Problem {
    id: number;
    title: string;
    points: number;
    isSolved: boolean;
}

export interface LeaderboardEntry {
    rank: number;
    name: string;
    solved: string;
    score: number;
}

export interface SprintData {
    timeRemaining: string;
    currentRank: number;
    participants: number;
    currentScore: number;
    solvedProblems: string;
    totalScore: number;
    problems: Problem[];
    leaderboard: LeaderboardEntry[];
}

export interface Question {
    id: string;
    number: number;
    title: string;
    topics: string[];
    difficulty: 'Easy' | 'Medium' | 'Hard';
  }
  
 export interface PracticeQuestionsData {
    questions: Question[];
  }
  