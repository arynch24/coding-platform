"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Menu, Save, Check, ArrowLeft, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Question } from '@/types/dashboard';
import FilterDropdown from '@/components/FilterDropdown';
import SearchBar from '@/components/SearchBar';
import Error from '@/components/ErrorBox';
import Loader from '@/components/Loader';

// Filter options
const difficultyOptions = ['All difficulties', 'Easy', 'Medium', 'Hard'];
const topicOptions = [
    'All Topics',
    'Array', 'String', 'Stack', 'Tree', 'Graph', 'Heap',
    'Dynamic Programming', 'Sorting', 'BST', 'BFS', 'DFS', 'Two Pointers'
];

// State type for points
interface PointsMap {
    [questionId: string]: number;
}

// Question Card Component
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
            className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                isSelected
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
                            onClick={(e) => e.stopPropagation()}
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
                        <div className="flex flex-wrap gap-1 mt-2">
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

                {/* Difficulty Badge */}
                <div className="ml-4">
                    <span
                        className={`px-3 py-1 text-sm font-medium rounded-full border ${
                            difficultyColors[question.difficulty as keyof typeof difficultyColors]
                        }`}
                    >
                        {question.difficulty}
                    </span>
                </div>
            </div>
        </div>
    );
};

// Selected Questions Summary with Point Input
interface SelectedQuestionsSummaryProps {
    selectedQuestions: Set<string>;
    allQuestions: Question[];
    onRemoveQuestion: (questionId: string) => void;
    onClearAll: () => void;
    pointsMap: PointsMap;
    setPointsMap: (map: PointsMap) => void;
}

const SelectedQuestionsSummary: React.FC<SelectedQuestionsSummaryProps> = ({
    selectedQuestions,
    allQuestions,
    onRemoveQuestion,
    onClearAll,
    pointsMap,
    setPointsMap
}) => {
    const selectedQuestionsData = allQuestions.filter(q => selectedQuestions.has(q.id));

    if (selectedQuestions.size === 0) return null;

    const handlePointChange = (questionId: string, value: string) => {
        const num = parseInt(value, 10);
        if (isNaN(num) || num < 1) {
            setPointsMap({ ...pointsMap, [questionId]: 1 });
        } else if (num > 10) {
            setPointsMap({ ...pointsMap, [questionId]: 10 });
        } else {
            setPointsMap({ ...pointsMap, [questionId]: num });
        }
    };

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
            <div className="space-y-2">
                {selectedQuestionsData.map((question) => (
                    <div
                        key={question.id}
                        className="flex items-center gap-3 bg-white border border-blue-300 rounded-md px-3 py-2"
                    >
                        <span className="text-sm font-medium flex-1">
                            {question.number}. {question.title}
                        </span>
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-600">Points:</label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={pointsMap[question.id] ?? 1}
                                onChange={(e) => handlePointChange(question.id, e.target.value)}
                                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemoveQuestion(question.id);
                            }}
                            className="text-red-500 hover:text-red-700"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Main Component
const ContestQuestionSelectionPage: React.FC = () => {
    const router = useRouter();
    const fullPath = typeof window !== "undefined" ? window.location.pathname : "";
    const contestId = fullPath.split("/")[3]; // /teacher/contest/[id]/manage → [3]

    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    // Filters
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [difficultyFilter, setDifficultyFilter] = useState<string>('All difficulties');
    const [topicFilter, setTopicFilter] = useState<string>('All Topics');
    const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

    // Selection
    const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
    const [pointsMap, setPointsMap] = useState<PointsMap>({});

    // Fetch questions from API
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                setIsLoading(true);
                setError('');

                const res = await axios.get<{ data: { problems: any[] } }>(
                    `${process.env.NEXT_PUBLIC_API_URL}/problems`,
                    { withCredentials: true }
                );

                const mappedQuestions: Question[] = res.data.data.problems.map((p, idx) => ({
                    id: p.id,
                    number: idx + 1,
                    title: p.title,
                    topics: p.tags?.map((t: { name: string }) => t.name) || [],
                    difficulty: p.difficulty,
                    isOwner: !!p.creator,
                    isPublic: p.isPublic
                }));

                setQuestions(mappedQuestions);
            } catch (err: any) {
                console.error('Failed to fetch questions:', err);
                setError(err.response?.data?.message || 'Failed to load questions.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuestions();
    }, []);

    // Filtered questions
    const filteredQuestions = useMemo(() => {
        return questions.filter((q) => {
            const matchesSearch =
                !searchTerm ||
                q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                q.number.toString().includes(searchTerm);

            const matchesDifficulty =
                difficultyFilter === 'All difficulties' || q.difficulty === difficultyFilter;

            const matchesTopic =
                topicFilter === 'All Topics' || q.topics.includes(topicFilter);

            return matchesSearch && matchesDifficulty && matchesTopic;
        });
    }, [questions, searchTerm, difficultyFilter, topicFilter]);

    // Toggle selection
    const handleToggleSelect = (questionId: string) => {
        setSelectedQuestions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(questionId)) {
                newSet.delete(questionId);
                // Remove points if deselected
                const newPoints = { ...pointsMap };
                delete newPoints[questionId];
                setPointsMap(newPoints);
            } else {
                newSet.add(questionId);
                // Default point = 1 if new
                setPointsMap(prev => ({ ...prev, [questionId]: 1 }));
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        const allIds = filteredQuestions.map(q => q.id);
        const allSelected = allIds.every(id => selectedQuestions.has(id));

        if (allSelected) {
            // Deselect all filtered
            const newSet = new Set(selectedQuestions);
            allIds.forEach(id => {
                newSet.delete(id);
                const newPoints = { ...pointsMap };
                delete newPoints[id];
                setPointsMap(newPoints);
            });
            setSelectedQuestions(newSet);
        } else {
            // Select all filtered
            const newSet = new Set([...selectedQuestions, ...allIds]);
            const newPoints = { ...pointsMap };
            allIds.forEach(id => {
                if (!(id in newPoints)) newPoints[id] = 1;
            });
            setSelectedQuestions(newSet);
            setPointsMap(newPoints);
        }
    };

    const handleRemoveQuestion = (questionId: string) => {
        setSelectedQuestions(prev => {
            const newSet = new Set(prev);
            newSet.delete(questionId);
            return newSet;
        });

        // Remove from points map
        setPointsMap(prev => {
            const newPoints = { ...prev };
            delete newPoints[questionId];
            return newPoints;
        });
    };

    const handleClearAll = () => {
        setSelectedQuestions(new Set());
        setPointsMap({});
    };

    // Save selected questions to contest
    const handleSave = async () => {
        if (!contestId) {
            setError('Contest ID is missing.');
            return;
        }

        if (selectedQuestions.size === 0) {
            alert('Please select at least one question.');
            return;
        }

        // Validate all points are in range
        const invalidPoint = Array.from(selectedQuestions).some(
            id => !pointsMap[id] || pointsMap[id] < 1 || pointsMap[id] > 10
        );

        if (invalidPoint) {
            alert('All questions must have points between 1 and 10.');
            return;
        }

        try {
            setIsSaving(true);
            setError('');

            const payload = {
                problems: Array.from(selectedQuestions).map(id => ({
                    problemId: id,
                    point: pointsMap[id] || 1
                }))
            };

            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/contests/problem/${contestId}`,
                payload,
                { withCredentials: true }
            );

            router.back(); // Success
        } catch (err: any) {
            console.error('Save failed:', err);
            setError(
                err.response?.data?.message || 'Failed to add questions to contest. Please try again.'
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleBack = () => {
        if (selectedQuestions.size > 0) {
            const confirmed = window.confirm('You have unsaved changes. Are you sure you want to go back?');
            if (!confirmed) return;
        }
        router.back();
    };

    if (isLoading) return <Loader text="Loading Question Bank..." />;
    if (error) return <Error message={error} onRetry={() => window.location.reload()} />;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto">
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
                            </div>
                        </div>
                        <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                            {selectedQuestions.size} selected
                        </div>
                    </div>

                    {/* Selected Summary with Points */}
                    <SelectedQuestionsSummary
                        selectedQuestions={selectedQuestions}
                        allQuestions={questions}
                        onRemoveQuestion={handleRemoveQuestion}
                        onClearAll={handleClearAll}
                        pointsMap={pointsMap}
                        setPointsMap={setPointsMap}
                    />

                    {/* Search & Filters */}
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                        <div className="flex-1 md:max-w-md">
                            <SearchBar
                                searchTerm={searchTerm}
                                onSearchChange={setSearchTerm}
                            />
                        </div>

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
                                {selectedQuestions.size === filteredQuestions.length
                                    ? 'Deselect All'
                                    : 'Select All'}
                            </button>
                        </div>

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
                <div className="p-6">
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

                {/* Save Button */}
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
            </div>
        </div>
    );
};

export default ContestQuestionSelectionPage;