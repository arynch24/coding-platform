"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PracticeQuestionsData } from '@/types/dashboard';
import FilterDropdown from '@/components/FilterDropdown';
import SearchBar from '@/components/SearchBar';
import QuestionCard from '@/components/QuestionCard';
import MobileFilters from '@/components/MobileFilters';
import Error from '@/components/ErrorBox';
import Loader from '@/components/Loader';
import axios from 'axios';

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

// Helper function to transform API data to component format
const transformApiData = (apiData: any): PracticeQuestionsData => {
  return {
    questions: apiData.data.problems.map((problem: any, index: number) => ({
      id: problem.id,
      number: index + 1, // Since API doesn't provide number, using index
      title: problem.title,
      topics: problem.problemTags.map((tag: any) => tag.name),
      difficulty: problem.difficulty,
      isSolved: problem.isSolved,
      creator: problem.creator,
    }))
  };
};

// Main Component
const PracticeQuestions: React.FC = () => {
  const [questionsData, setQuestionsData] = useState<PracticeQuestionsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Filter states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All difficulties');
  const [topicFilter, setTopicFilter] = useState<string>('All Topics');
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  // API call to fetch questions
  const fetchQuestionsData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError('');

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/students/problems`, {
        withCredentials: true,
      });

      const transformedData = transformApiData(response.data);
      console.log(transformedData);
      setQuestionsData(transformedData);
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
    router.push(`/problems/${questionId}`);
  };

  // Show loading spinner while fetching data
  if (isLoading) {
    return <Loader text="Questions are loading" />;
  }

  // Show error message if there's an error
  if (error) {
    return <Error message={error} onRetry={fetchQuestionsData} />;
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
                role="student"
              />
            ))
          )}
        </div>

        {/* Mobile Filters Modal */}
        {/* <MobileFilters
          isOpen={showMobileFilters}
          onClose={() => setShowMobileFilters(false)}
          difficultyFilter={difficultyFilter}
          topicFilter={topicFilter}
          onDifficultyChange={setDifficultyFilter}
          onTopicChange={setTopicFilter}
        /> */}
      </div>
    </div>
  );
};

export default PracticeQuestions;