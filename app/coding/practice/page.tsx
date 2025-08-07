"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Menu } from 'lucide-react';
// import { useRouter } from 'next/navigation';

// Types
interface Question {
  id: string;
  number: number;
  title: string;
  topics: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface PracticeQuestionsData {
  questions: Question[];
}

// Mock data
const mockData: PracticeQuestionsData = {
  questions: [
    {
      id: '1',
      number: 1,
      title: 'Two Sum Variation',
      topics: ['Array', 'Stack'],
      difficulty: 'Easy'
    },
    {
      id: '2',
      number: 2,
      title: 'Binary Search Tree Insert',
      topics: ['Tree', 'BST'],
      difficulty: 'Medium'
    },
    {
      id: '3',
      number: 3,
      title: 'Maximum Subarray Sum',
      topics: ['Array', 'Dynamic Programming'],
      difficulty: 'Medium'
    },
    {
      id: '4',
      number: 4,
      title: 'Valid Parentheses',
      topics: ['Stack', 'String'],
      difficulty: 'Easy'
    },
    {
      id: '5',
      number: 5,
      title: 'Merge Intervals',
      topics: ['Array', 'Sorting'],
      difficulty: 'Medium'
    },
    {
      id: '6',
      number: 6,
      title: 'Longest Common Subsequence',
      topics: ['Dynamic Programming', 'String'],
      difficulty: 'Hard'
    },
    {
      id: '7',
      number: 7,
      title: 'Binary Tree Level Order',
      topics: ['Tree', 'BFS'],
      difficulty: 'Medium'
    },
    {
      id: '8',
      number: 8,
      title: 'Graph Cycle Detection',
      topics: ['Graph', 'DFS'],
      difficulty: 'Hard'
    },
    {
      id: '9',
      number: 9,
      title: 'Heap Sort Implementation',
      topics: ['Heap', 'Sorting'],
      difficulty: 'Hard'
    },
    {
      id: '10',
      number: 10,
      title: 'Palindrome Check',
      topics: ['String', 'Two Pointers'],
      difficulty: 'Easy'
    }
  ]
};

// Filter options
const difficultyOptions = ['All difficulties', 'Easy', 'Medium', 'Hard'];
const topicOptions = [
  'All Topics',
  'Array',
  'String',
  'Stack',
  'Tree',
  'Graph',
  'Heap',
  'Dynamic Programming',
  'Sorting',
  'BST',
  'BFS',
  'DFS',
  'Two Pointers'
];

// Reusable Components
const SearchBar: React.FC<{
  searchTerm: string;
  onSearchChange: (value: string) => void;
}> = ({ searchTerm, onSearchChange }) => (
  <div className="relative flex-1 max-w-lg">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
    <input
      type="text"
      placeholder="Search question by name or number..."
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
      className="w-full pl-10 pr-4 py-3 bg-qc-light/10 rounded-2xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
    />
  </div>
);

const FilterDropdown: React.FC<{
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
  placeholder: string;
}> = ({ options, selected, onSelect, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-qc-dark text-white rounded-lg hover:bg-qc-dark/95 transition-colors min-w-[140px] justify-between"
      >
        <span className="text-sm font-medium truncate">
          {selected === options[0] ? placeholder : selected}
        </span>
        <ChevronDown className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} size={16} />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => {
                  onSelect(option);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  selected === option ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const DifficultyBadge: React.FC<{ difficulty: 'Easy' | 'Medium' | 'Hard' }> = ({ difficulty }) => {
  const colors = {
    Easy: 'bg-green-100 text-green-700',
    Medium: 'bg-yellow-100 text-yellow-700',
    Hard: 'bg-red-100 text-red-700'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[difficulty]}`}>
      {difficulty}
    </span>
  );
};

const QuestionCard: React.FC<{ 
  question: Question; 
  onClick: (questionId: string) => void;
}> = ({ question, onClick }) => (
  <div 
    onClick={() => onClick(question.id)}
    className="bg-qc-light/10 rounded-xl p-4 hover:bg-qc-light/20 transition-colors cursor-pointer group"
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <h3 className="text-qc-primary font-medium group-hover:text-qc-primary/90 transition-colors">
          {question.number}. {question.title}
        </h3>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-zinc-600 text-sm">
          {question.topics.join(', ')}
        </div>
        <DifficultyBadge difficulty={question.difficulty} />
      </div>
    </div>
  </div>
);

const MobileFilters: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  difficultyFilter: string;
  topicFilter: string;
  onDifficultyChange: (difficulty: string) => void;
  onTopicChange: (topic: string) => void;
}> = ({ isOpen, onClose, difficultyFilter, topicFilter, onDifficultyChange, onTopicChange }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 z-50 md:hidden">
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
            <div className="space-y-2">
              {difficultyOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => onDifficultyChange(option)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    difficultyFilter === option 
                      ? 'bg-blue-100 text-blue-700 font-medium' 
                      : 'bg-qc-light/10 text-gray-700 hover:bg-qc-light/20'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {topicOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => onTopicChange(option)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    topicFilter === option 
                      ? 'bg-blue-100 text-blue-700 font-medium' 
                      : 'bg-qc-light/10 text-gray-700 hover:bg-qc-light/20'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full mt-6 py-3 bg-qc-dark text-white rounded-lg hover:bg-qc-dark/95 transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </>
  );
};

// Main Component
const PracticeQuestions: React.FC = () => {
  // const router = useRouter();
  const [questionsData, setQuestionsData] = useState<PracticeQuestionsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All difficulties');
  const [topicFilter, setTopicFilter] = useState<string>('All Topics');
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  // Simulate API call
  const fetchQuestionsData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError('');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would be:
      // const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/questions`, {
      //   withCredentials: true,
      // });
      // setQuestionsData(response.data);
      
      setQuestionsData(mockData);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestionsData();
  }, []);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    if (!questionsData) return [];

    return questionsData.questions.filter((question) => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.number.toString().includes(searchTerm);

      // Difficulty filter
      const matchesDifficulty = difficultyFilter === 'All difficulties' || 
        question.difficulty === difficultyFilter;

      // Topic filter
      const matchesTopic = topicFilter === 'All Topics' || 
        question.topics.some(topic => topic === topicFilter);

      return matchesSearch && matchesDifficulty && matchesTopic;
    });
  }, [questionsData, searchTerm, difficultyFilter, topicFilter]);

  const handleQuestionClick = (questionId: string) => {
    // router.push(`/practice/${questionId}`);
    console.log(`Navigate to question ${questionId}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div>
        <p className="mt-4 text-gray-600">Loading Practice Questions</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={fetchQuestionsData}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-qc-dark transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="h-full px-4 py-6 overflow-y-auto">
        {/* Header with Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <SearchBar 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
            
            {/* Desktop Filters */}
            <div className="hidden md:flex items-center gap-3">
              <FilterDropdown
                options={difficultyOptions}
                selected={difficultyFilter}
                onSelect={setDifficultyFilter}
                placeholder="All difficulties"
              />
              
              <FilterDropdown
                options={topicOptions}
                selected={topicFilter}
                onSelect={setTopicFilter}
                placeholder="All Topics"
              />
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="md:hidden flex items-center gap-2 px-4 py-2 bg-qc-dark text-white rounded-lg hover:bg-qc-dark/95 transition-colors"
            >
              <Menu size={16} />
              <span className="text-sm font-medium">Filters</span>
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-3">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No questions found</p>
              <p className="text-gray-400 text-sm mt-2">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            filteredQuestions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onClick={handleQuestionClick}
              />
            ))
          )}
        </div>

        {/* Mobile Filters Modal */}
        <MobileFilters
          isOpen={showMobileFilters}
          onClose={() => setShowMobileFilters(false)}
          difficultyFilter={difficultyFilter}
          topicFilter={topicFilter}
          onDifficultyChange={setDifficultyFilter}
          onTopicChange={setTopicFilter}
        />
      </div>
    </div>
  );
};

export default PracticeQuestions;