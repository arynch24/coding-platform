"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PracticeQuestionsData, Question } from '@/types/dashboard';
import FilterDropdown from '@/components/FilterDropdown';
import SearchBar from '@/components/SearchBar';
import QuestionCard from '@/components/QuestionCard';
import MobileFilters from '@/components/MobileFilters';
import Error from '@/components/ErrorBox';
import Loader from '@/components/Loader';
import { Plus } from 'lucide-react';

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

  const router = useRouter();

  const handleQuestionClick = (questionId: string) => {
    // router.push(`/practice/${questionId}`);
    router.push(`/question`);
    // console.log(`Navigate to question ${questionId}`);
  };

  const handleDelete = (questionId: string) => {
    // Handle question deletion logic here
    console.log(`Deleting question with ID: ${questionId}`);
    // Optionally, you can refetch the questions data after deletion
    fetchQuestionsData();
  }

  const handleEdit = (questionId: string) => {
    // Handle question edit logic here
    console.log(`Editing question with ID: ${questionId}`);
    // Optionally, you can redirect to an edit page or open a modal
    // router.push(`/question/edit/${questionId}`);
  };

  const handleCreateQuestion = () => {
    // Redirect to question creation page
    router.push('/teacher/question-bank/create');
  }

  // Show loading spinner while fetching data
  if (isLoading) {
    return <Loader text="Loading Exam Dashboard" />;
  }

  // Show error message if there's an error
  if (error) {
    return <Error message={error} onRetry={fetchQuestionsData} />;
  }

  return (
    <div className="h-full">
      <div className="h-full px-4 py-6 overflow-y-auto">
        {/* Header with Search and Filters */}
        <div className="mb-6 w-full">
          <div className="w-full flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className='w-full md:w-1/2'>
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            </div>

            {/* Desktop Filters */}
            <div className="w-1/3 hidden md:flex md:justify-between items-center ">
              <div className='flex gap-4'>
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
            </div>

            <button
              className='md:w-1/5 bg-qc-dark/95 hover:bg-qc-dark text-white px-4 py-2 rounded-lg hover:bg-qc-primary-dark transition-colors mr-6 cursor-pointer'
              onClick={handleCreateQuestion}>
              <Plus className="inline mr-2" />
              Add Question
            </button>

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
                role="teacher"
                handleDelete={handleDelete}
                handleEdit={handleEdit}
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