import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { MarkdownPreviewDialog } from './MarkdownPreviewDialog';
import axios from 'axios';

interface Tag {
    id: string;
    name: string;
}

interface Question {
    id: string;
    title: string;
    constraints: string;
    problemStatement: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    isPublic: boolean;
    problemWeight: number;
    testcaseWeight: number;
    tags: Tag[];
}

interface QuestionDetailsTabProps {
    question: Question;
    onDataChange: () => void;
        onSaveSuccess: () => void;
}

export const QuestionDetailsTab: React.FC<QuestionDetailsTabProps> = ({
    question,
    onDataChange,
    onSaveSuccess
}) => {
    const [formData, setFormData] = useState({
        title: question.title || '',
        constraints: question.constraints || '',
        problemStatement: question.problemStatement || '',
        difficulty: question.difficulty || 'Medium' as const,
        isPublic: question.isPublic || false,
        problemWeight: question.problemWeight || 50,
        testcaseWeight: question.testcaseWeight || 50,
        tags: question.tags?.map(tag => tag.id) || [],
    });
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);
    const [selectedTags, setSelectedTags] = useState<Tag[]>(question.tags || []);
    const [previewDialog, setPreviewDialog] = useState({
        isOpen: false,
        content: '',
        title: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchAvailableTags();
    }, []);

    useEffect(() => {
        // Update selected tags when formData.tags changes
        const newSelectedTags = availableTags.filter(tag => formData.tags.includes(tag.id));
        setSelectedTags(newSelectedTags);
    }, [formData.tags, availableTags]);

    const fetchAvailableTags = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tags`, {
                withCredentials: true
            });
            const tags = response.data.data;
            setAvailableTags(tags);
        } catch (error) {
            console.error('Error fetching tags:', error);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        onDataChange();
    };


    // const handleSaveDetailsChanges = async (details: any) => {
    //     try {
    //         const response = await axios.patch(
    //             `${process.env.NEXT_PUBLIC_API_URL}/problems/${questionId}`,
    //             { ...details },
    //             {
    //                 headers: { 'Content-Type': 'application/json' },
    //                 withCredentials: true
    //             }
    //         );
    //     } catch (error) {
    //         console.error('Error saving details changes:', error);
    //     }
    // };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const updateData = {
                title: formData.title,
                constraints: formData.constraints,
                problemStatement: formData.problemStatement,
                difficulty: formData.difficulty,
                isPublic: formData.isPublic,
                problemWeight: formData.problemWeight,
                testcaseWeight: formData.testcaseWeight,
                tags: formData.tags, // Array of tag IDs
            };

            await axios.patch(
                `${process.env.NEXT_PUBLIC_API_URL}/problems/${question.id}`,
                updateData,
                { withCredentials: true }
            );

            // Call onDataChange to refresh the parent component
            onSaveSuccess();

            // Show success message (you might want to add a toast notification here)
            console.log('Question updated successfully');
        } catch (error) {
            console.error('Error saving question:', error);
            // Handle error (you might want to show an error toast here)
        } finally {
            setIsLoading(false);
        }
    };

    const addTag = (tagId: string) => {
        if (!formData.tags.includes(tagId)) {
            handleChange('tags', [...formData.tags, tagId]);
        }
    };

    const removeTag = (tagId: string) => {
        handleChange('tags', formData.tags.filter((id: string) => id !== tagId));
    };

    const openPreview = (content: string, title: string) => {
        setPreviewDialog({
            isOpen: true,
            content,
            title
        });
    };

    const closePreview = () => {
        setPreviewDialog({
            isOpen: false,
            content: '',
            title: ''
        });
    };

    return (
        <>
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title
                            </label>
                            <Input
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Difficulty
                            </label>
                            <Select
                                value={formData.difficulty}
                                onChange={(value) => handleChange('difficulty', value)}
                                options={[
                                    { value: 'Easy', label: 'Easy' },
                                    { value: 'Medium', label: 'Medium' },
                                    { value: 'Hard', label: 'Hard' },
                                ]}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Problem Weight (0-100)
                                </label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.problemWeight}
                                    onChange={(e) => handleChange('problemWeight', parseInt(e.target.value))}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Testcase Weight (0-100)
                                </label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.testcaseWeight}
                                    onChange={(e) => handleChange('testcaseWeight', parseInt(e.target.value))}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={formData.isPublic}
                                    onChange={(e) => handleChange('isPublic', e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                                <span className="text-sm font-medium text-gray-700">Public Question</span>
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tags
                            </label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {selectedTags.map((tag: Tag) => (
                                    <span
                                        key={tag.id}
                                        className="bg-blue-100 text-navy-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                    >
                                        {tag.name}
                                        <button
                                            onClick={() => removeTag(tag.id)}
                                            className="text-navy-600 hover:text-navy-800"
                                            type="button"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <Select
                                placeholder="Add a tag..."
                                onChange={(value) => addTag(value)}
                                options={availableTags
                                    .filter(tag => !formData.tags.includes(tag.id))
                                    .map(tag => ({ value: tag.id, label: tag.name }))}
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Problem Statement
                                </label>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openPreview(formData.problemStatement, 'Problem Statement Preview')}
                                    disabled={!formData.problemStatement.trim()}
                                >
                                    Preview
                                </Button>
                            </div>
                            <textarea
                                value={formData.problemStatement}
                                onChange={(e) => handleChange('problemStatement', e.target.value)}
                                rows={8}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                                placeholder="Write your problem statement in markdown..."
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Constraints
                                </label>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openPreview(formData.constraints, 'Constraints Preview')}
                                    disabled={!formData.constraints.trim()}
                                >
                                    Preview
                                </Button>
                            </div>
                            <textarea
                                value={formData.constraints}
                                onChange={(e) => handleChange('constraints', e.target.value)}
                                rows={4}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                                placeholder="Write constraints in markdown..."
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            <MarkdownPreviewDialog
                isOpen={previewDialog.isOpen}
                onClose={closePreview}
                content={previewDialog.content}
                title={previewDialog.title}
            />
        </>
    );
};

export default QuestionDetailsTab;