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
    totalParticipants: number;
}

export interface UpcomingExam {
    id: string;
    title: string;
    description: string;
    tags: ExamTag[];
    date: string;
    time: string;
    duration: string;
    live: boolean
    teacher?: string;
}

export interface ExamTag {
    name: string;
    color: string;
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
    isSolved?: boolean;
}

export interface PracticeQuestionsData {
    questions: Question[];
}

export interface MenuItem {
    id: string;
    label: string;
    action: () => void;
    icon?: React.ReactNode;
    disabled?: boolean;
    variant?: 'default' | 'danger';
}

export interface ExamResult {
  id: string;
  examName: string;
  description: string;
  subject: string;
  dateTime: string;
  score: number;
  rank: number;
  finalScore: number;
  finalRank: number;
  solved: number;
  total: number;
  maximumPossibleScore: number;
  feedback?: string;
  startDate: string;
  endDate: string;
  isPublished: boolean;
}

export interface Exam {
    id: string;
    title: string;
    description: string;
    dateTime: string;
    participants: number;
    status: 'Published' | 'Unpublished';
}

export interface Student {
    id: string;
    rank: number;
    name: string;
    email: string;
    obtainedScore: number;
    solvedQuestions: string;
}

export interface ActionData {
    type: string;
    reason: string;
    notes?: string;
}

export interface TestCase {
    id: string;
    name: string;
    input: string;
    expectedOutput: string;
    points: number;
    type: 'sample' | 'regular';
}

export interface Question {
  id: string;
  number: number;
  title: string;
  topics: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  isSolved?: boolean;
  isOwner: boolean;
  creator?: {
    id: string;
    name: string;
    email: string;
  } | null;
  isPublic: boolean;
}

export interface PracticeQuestionsData {
  questions: Question[];
}

// API Response Types
export interface ApiTag {
  id: string;
  name: string;
}

export interface ApiCreator {
  id: string;
  name: string;
  email: string;
}

export interface ApiProblem {
  id: string;
  title: string;
  problemStatement: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  isPublic: boolean;
  tags: ApiTag[];
  creator: ApiCreator | null;
  isOwner: boolean;
}

export interface ApiProblemsResponse {
  data: {
    problems: ApiProblem[];
  };
}

export interface Contest {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  isOpen: boolean;
  batchContests: { id: string; name: string; }[];
  contestModerators: { id: string; name: string; email: string; }[];
  tags: { id: string; name: string; }[];
  allowedLanguages: { id: string; name: string; }[];
  subject: { id: string; name: string; } | null;
}

export interface ContestFormData {
  title: string;
  batch: string;
  description: string;
  topics: string[];
  language: string;
  subject: string;
  date: string;
  time: string;
  duration: string;
  moderators: string[];
}