"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Menu, Save, Check, ArrowLeft, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PracticeQuestionsData, Question } from '@/types/dashboard';
import FilterDropdown from '@/components/FilterDropdown';
import SearchBar from '@/components/SearchBar';
import MobileFilters from '@/components/MobileFilters';
import Error from '@/components/ErrorBox';
import Loader from '@/components/Loader';

// Mock data
const mockData: PracticeQuestionsData = {
    questions: [
        {
            id: '1',
            number: 1,
            title: 'Two Sum Variation',
            topics: ['Array', 'Stack'],
            difficulty: 'Easy',
            isOwner: true,
            isPublic: true
        },
        {
            id: '2',
            number: 2,
            title: 'Binary Search Tree Insert',
            topics: ['Tree', 'BST'],
            difficulty: 'Medium',
            isOwner: true,
            isPublic: true
        },
        {
            id: '3',
            number: 3,
            title: 'Maximum Subarray Sum',
            topics: ['Array', 'Dynamic Programming'],
            difficulty: 'Medium',
            isOwner: true,
            isPublic: true
        },
        {
            id: '4',
            number: 4,
            title: 'Valid Parentheses',
            topics: ['Stack', 'String'],
            difficulty: 'Easy',
            isOwner: true,
            isPublic: true
        },
        {
            id: '5',
            number: 5,
            title: 'Merge Intervals',
            topics: ['Array', 'Sorting'],
            difficulty: 'Medium',
            isOwner: true,
            isPublic: true
        },
        {
            id: '6',
            number: 6,
            title: 'Longest Common Subsequence',
            topics: ['Dynamic Programming', 'String'],
            difficulty: 'Hard',
            isOwner: true,
            isPublic: true
        },
        {
            id: '7',
            number: 7,
            title: 'Binary Tree Level Order',
            topics: ['Tree', 'BFS'],
            difficulty: 'Medium',
            isOwner: true,
            isPublic: true
        },
        {
            id: '8',
            number: 8,
            title: 'Graph Cycle Detection',
            topics: ['Graph', 'DFS'],
            difficulty: 'Hard',
            isOwner: true,
            isPublic: true
        },
        {
            id: '9',
            number: 9,
            title: 'Heap Sort Implementation',
            topics: ['Heap', 'Sorting'],
            difficulty: 'Hard',
            isOwner: true,
            isPublic: true
        },
        {
            id: '10',
            number: 10,
            title: 'Palindrome Check',
            topics: ['String', 'Two Pointers'],
            difficulty: 'Easy',
            isOwner: true,
            isPublic: true
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

// Question Card Component with Checkbox
interface QuestionCardProps {
    question: Question;
    isSelected: boolean;
    onToggleSelect: (questionId: string) => void;
}

const SelectableQuestionCard: React.FC<QuestionCardProps> = ({
    question,
    isSelected,
    onToggleSelect
}) => {
    const difficultyColors = {
        Easy: 'bg-green-100 text-green-800 border-green-200',
        Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        Hard: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
        <div
            className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${isSelected
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
            onClick={() => onToggleSelect(question.id)}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                    {/* Checkbox */}
                    <div className="relative">
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onToggleSelect(question.id)}
                            className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        {isSelected && (
                            <Check className="absolute top-0.5 left-0.5 w-3 h-3 text-white pointer-events-none" />
                        )}
                    </div>

                    {/* Question Info */}
                    <div className="flex-1">
                        <div className="flex items-center space-x-3">
                            <span className="text-lg font-semibold text-gray-900">
                                {question.number}. {question.title}
                            </span>
                        </div>

                        <div className="flex items-center space-x-2 mt-2">
                            <div className="flex flex-wrap gap-1">
                                {question.topics.map((topic, index) => (
                                    <span
                                        key={index}
                                        className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md"
                                    >
                                        {topic}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Difficulty Badge */}
                <div className="ml-4">
                    <span
                        className={`px-3 py-1 text-sm font-medium rounded-full border ${difficultyColors[question.difficulty as keyof typeof difficultyColors]
                            }`}
                    >
                        {question.difficulty}
                    </span>
                </div>
            </div>
        </div>
    );
};

// Selected Questions Summary Component
interface SelectedQuestionsSummaryProps {
    selectedQuestions: Set<string>;
    allQuestions: Question[];
    onRemoveQuestion: (questionId: string) => void;
    onClearAll: () => void;
}

const SelectedQuestionsSummary: React.FC<SelectedQuestionsSummaryProps> = ({
    selectedQuestions,
    allQuestions,
    onRemoveQuestion,
    onClearAll
}) => {
    const selectedQuestionsData = allQuestions.filter(q => selectedQuestions.has(q.id));

    if (selectedQuestions.size === 0) return null;

    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-blue-900">
                    Selected Questions ({selectedQuestions.size})
                </h3>
                <button
                    onClick={onClearAll}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                    Clear All
                </button>
            </div>
            <div className="flex flex-wrap gap-2">
                {selectedQuestionsData.map((question) => (
                    <div
                        key={question.id}
                        className="flex items-center gap-2 bg-white border border-blue-300 rounded-md px-3 py-1"
                    >
                        <span className="text-sm font-medium">
                            {question.number}. {question.title}
                        </span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemoveQuestion(question.id);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Main Page Component
const ContestQuestionSelectionPage: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const contestId = searchParams.get('contestId');
    const contestName = searchParams.get('contestName') || 'New Contest';

    const [questionsData, setQuestionsData] = useState<PracticeQuestionsData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    // Filter states
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [difficultyFilter, setDifficultyFilter] = useState<string>('All difficulties');
    const [topicFilter, setTopicFilter] = useState<string>('All Topics');
    const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

    // Selection state
    const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());

    // Simulate API call to fetch questions
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

    // Handle question selection
    const handleToggleSelect = (questionId: string) => {
        setSelectedQuestions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(questionId)) {
                newSet.delete(questionId);
            } else {
                newSet.add(questionId);
            }
            return newSet;
        });
    };

    // Handle select all
    const handleSelectAll = () => {
        if (selectedQuestions.size === filteredQuestions.length) {
            // Deselect all
            setSelectedQuestions(new Set());
        } else {
            // Select all filtered questions
            setSelectedQuestions(new Set(filteredQuestions.map(q => q.id)));
        }
    };

    // Handle remove single question from selection
    const handleRemoveQuestion = (questionId: string) => {
        setSelectedQuestions(prev => {
            const newSet = new Set(prev);
            newSet.delete(questionId);
            return newSet;
        });
    };

    // Handle clear all selections
    const handleClearAll = () => {
        setSelectedQuestions(new Set());
    };

    // Handle save and redirect back
    const handleSave = async () => {
        try {
            setIsSaving(true);

            const selectedQuestionIds = Array.from(selectedQuestions);

            // API call to save selected questions to contest
            // const response = await axios.post(
            //   `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/contests/${contestId}/questions`,
            //   { questionIds: selectedQuestionIds },
            //   { withCredentials: true }
            // );

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            console.log('Saving selected questions for contest:', contestId);
            console.log('Selected question IDs:', selectedQuestionIds);

            // Show success and redirect back to contest creation/edit page
            alert(`Successfully added ${selectedQuestionIds.length} questions to ${contestName}!`);
            router.back(); // or router.push('/contests/create') or wherever you want to redirect

        } catch (err: any) {
            setError(err.message || 'Failed to save questions');
        } finally {
            setIsSaving(false);
        }
    };

    // Handle back navigation
    const handleBack = () => {
        if (selectedQuestions.size > 0) {
            const confirmed = window.confirm('You have unsaved changes. Are you sure you want to go back?');
            if (!confirmed) return;
        }
        router.back();
    };

    // Show loading spinner while fetching data
    if (isLoading) {
        return <Loader text="Loading Question Bank" />;
    }

    // Show error message if there's an error
    if (error) {
        return <Error message={error} onRetry={fetchQuestionsData} />;
    }

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto  ">
                {/* Header */}
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                <ArrowLeft size={20} />
                                <span className="font-medium">Back</span>
                            </button>
                            <div className="h-6 w-px bg-gray-300"></div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Select Questions</h1>
                                <p className="text-gray-600">for "{contestName}"</p>
                            </div>
                        </div>
                        <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                            {selectedQuestions.size} selected
                        </div>
                    </div>

                    {/* Selected Questions Summary */}
                    <SelectedQuestionsSummary
                        selectedQuestions={selectedQuestions}
                        allQuestions={questionsData?.questions || []}
                        onRemoveQuestion={handleRemoveQuestion}
                        onClearAll={handleClearAll}
                    />

                    {/* Search and Filters */}
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                        <div className='flex-1 md:max-w-md'>
                            <SearchBar
                                searchTerm={searchTerm}
                                onSearchChange={setSearchTerm}
                            />
                        </div>

                        {/* Desktop Filters */}
                        <div className="hidden md:flex items-center gap-4">
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
                                onClick={handleSelectAll}
                                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                                {selectedQuestions.size === filteredQuestions.length ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>

                        {/* Mobile Filter Toggle */}
                        <button
                            onClick={() => setShowMobileFilters(true)}
                            className="md:hidden flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            <Menu size={16} />
                            <span className="text-sm font-medium">Filters</span>
                        </button>
                    </div>
                </div>

                {/* Questions List */}
                <div className=" p-6">
                    <div className="space-y-3 mb-6">
                        {filteredQuestions.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">No questions found</p>
                                <p className="text-gray-400 text-sm mt-2">
                                    Try adjusting your search or filter criteria
                                </p>
                            </div>
                        ) : (
                            filteredQuestions.map((question) => (
                                <SelectableQuestionCard
                                    key={question.id}
                                    question={question}
                                    isSelected={selectedQuestions.has(question.id)}
                                    onToggleSelect={handleToggleSelect}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Save Button - Fixed at bottom */}
                {selectedQuestions.size > 0 && (
                    <div className="fixed bottom-6 right-6 z-50">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                        >
                            <Save size={20} />
                            <span className="font-medium">
                                {isSaving ? 'Saving...' : `Save Questions (${selectedQuestions.size})`}
                            </span>
                        </button>
                    </div>
                )}

                {/* Mobile Filters Modal */}
                {/* <MobileFilters
                    isOpen={showMobileFilters}
                    onClose={() => setShowMobileFilters(false)}
                    difficultyFilter={difficultyFilter}
                    topicFilter={topicFilter}
                    // statusFilter={statusFilter}
                    onDifficultyChange={setDifficultyFilter}
                    onTopicChange={setTopicFilter}
                    // onStatusChange={setStatusFilter}
                /> */}
            </div>
        </div>
    );
};

export default ContestQuestionSelectionPage;