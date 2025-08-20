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
import axios from 'axios';

// Transform API response to match frontend Question type
const transformApiQuestion = (apiQuestion: any, currentUserId: string): Question => {
  return {
    id: apiQuestion.id,
    number: parseInt(apiQuestion.id), // Using id as number since API doesn't provide number
    title: apiQuestion.title,
    topics: apiQuestion.tags.map((tag: any) => tag.name),
    difficulty: apiQuestion.difficulty,
    isSolved: false, // Default value, can be updated based on user progress
    isOwner: apiQuestion.isOwner,
    creator: apiQuestion.creator,
    isPublic: apiQuestion.isPublic,
  };
};

// Filter options
const difficultyOptions = ['All difficulties', 'Easy', 'Medium', 'Hard'];
const statusOptions = ['All Questions', 'My Questions', 'Public Questions'];

// Main Component
const PracticeQuestions: React.FC = () => {
  const router = useRouter();
  const [questionsData, setQuestionsData] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>(''); // You'll need to get this from auth context

  // Filter states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All difficulties');
  const [statusFilter, setStatusFilter] = useState<string>('All Questions');
  const [topicFilter, setTopicFilter] = useState<string>('All Topics');
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  // Extract unique topics from questions
  const topicOptions = useMemo(() => {
    const allTopics = questionsData.flatMap(q => q.topics);
    const uniqueTopics = Array.from(new Set(allTopics)).sort();
    return ['All Topics', ...uniqueTopics];
  }, [questionsData]);

  // Fetch questions from API
  const fetchQuestionsData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError('');

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/problems`, {
        withCredentials: true,
      });

      // Transform API response to match frontend structure
      const transformedQuestions = response.data.data.problems.map((q: any) =>
        transformApiQuestion(q, currentUserId)
      );

      setQuestionsData(transformedQuestions);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch questions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestionsData();
  }, []);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return questionsData.filter((question) => {
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

      // Status filter (ownership)
      const matchesStatus =
        statusFilter === 'All Questions' ||
        (statusFilter === 'My Questions' && question.isOwner) ||
        (statusFilter === 'Public Questions' && question.isPublic);

      return matchesSearch && matchesDifficulty && matchesTopic && matchesStatus;
    });
  }, [questionsData, searchTerm, difficultyFilter, topicFilter, statusFilter]);

  const handleQuestionClick = (questionId: string) => {
    router.push(`/question/${questionId}`);
  };

  const handleDelete = async (questionId: string) => {
    const question = questionsData.find(q => q.id === questionId);

    if (!question?.isOwner) {
      alert(`This question was created by ${question?.creator?.name || 'another teacher'}. You can only delete questions you've created.`);
      return;
    }

    try {
      // Confirm deletion
      const confirmDelete = window.confirm('Are you sure you want to delete this question?');
      if (!confirmDelete) return;

      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/problems/${questionId}`, {
        withCredentials: true,
      });

      // Refresh questions after successful deletion
      await fetchQuestionsData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete question');
    }
  };

  const handleEdit = (questionId: string) => {
    const question = questionsData.find(q => q.id === questionId);

    if (!question?.isOwner) {
      alert(`This question was created by ${question?.creator?.name || 'another teacher'}. You can only edit questions you've created. Contact them if you need changes.`);
      return;
    }

    router.push(`/teacher/questions/${questionId}`);
  };

  const handleCreateQuestion = () => {
    router.push('/teacher/questions/create');
  };

  // Show loading spinner while fetching data
  if (isLoading) {
    return <Loader text="Loading Questions..." />;
  }

  // Show error message if there's an error
  if (error) {
    return <Error message={error} onRetry={fetchQuestionsData} />;
  }

  return (
    <div className="h-full">
      <div className="h-full px-4 py-6 overflow-y-auto">
        {/* Header */}
        <div className="mb-6">
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center">
            <div className="w-full">
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            </div>

            {/* Desktop Filters */}
            <div className="hidden lg:flex gap-3 items-center">
              <FilterDropdown
                options={statusOptions}
                selected={statusFilter}
                onSelect={setStatusFilter}
                placeholder="All Questions"
              />

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
              <button
                className="bg-qc-dark hover:bg-qc-dark/90 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                onClick={handleCreateQuestion}
              >
                <Plus size={16} />
                Add Question
              </button>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-qc-dark text-white rounded-lg hover:bg-qc-dark/95 transition-colors"
            >
              <Menu size={16} />
              <span className="text-sm font-medium">Filters</span>
            </button>
          </div>

          {/* Filter Summary */}
          {(searchTerm || difficultyFilter !== 'All difficulties' || topicFilter !== 'All Topics' || statusFilter !== 'All Questions') && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex flex-wrap gap-2 text-sm text-blue-700 items-center">
                <span className="font-medium">Active filters:</span>
                {searchTerm && <span className="bg-blue-100 px-2 py-1 rounded">Search: "{searchTerm}"</span>}
                {difficultyFilter !== 'All difficulties' && <span className="bg-blue-100 px-2 py-1 rounded">Difficulty: {difficultyFilter}</span>}
                {topicFilter !== 'All Topics' && <span className="bg-blue-100 px-2 py-1 rounded">Topic: {topicFilter}</span>}
                {statusFilter !== 'All Questions' && <span className="bg-blue-100 px-2 py-1 rounded">Status: {statusFilter}</span>}
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setDifficultyFilter('All difficulties');
                    setTopicFilter('All Topics');
                    setStatusFilter('All Questions');
                  }}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredQuestions.length} of {questionsData.length} questions
        </div>

        {/* Questions List */}
        <div className="space-y-3">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-500 text-lg font-medium">No questions found</p>
              <p className="text-gray-400 text-sm mt-2">
                {searchTerm || difficultyFilter !== 'All difficulties' || topicFilter !== 'All Topics' || statusFilter !== 'All Questions'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Create your first question to get started'
                }
              </p>
              {questionsData.length === 0 && (
                <button
                  onClick={handleCreateQuestion}
                  className="mt-4 bg-qc-dark text-white px-6 py-2 rounded-lg hover:bg-qc-dark/90 transition-colors"
                >
                  Create First Question
                </button>
              )}
            </div>
          ) : (
            filteredQuestions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={{ ...question, number: index + 1 }} // Sequential numbering for display
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
          statusFilter={statusFilter}
          onDifficultyChange={setDifficultyFilter}
          onTopicChange={setTopicFilter}
          onStatusChange={setStatusFilter}
        />
      </div>
    </div>
  );
};

export default PracticeQuestions;