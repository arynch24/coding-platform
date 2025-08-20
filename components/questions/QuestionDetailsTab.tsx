import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { MarkdownPreview } from './MarkdownPreview';
import axios from 'axios';

interface QuestionDetailsTabProps {
    question: any;
    onSave: (data: any) => Promise<void>;
    onDataChange: () => void;
}

export const QuestionDetailsTab: React.FC<QuestionDetailsTabProps> = ({
    question,
    onSave,
    onDataChange,
}) => {
    const [formData, setFormData] = useState({
        title: question.title || '',
        constraints: question.constraints || '',
        problemStatement: question.problemStatement || '',
        difficulty: question.difficulty || 'Medium',
        isPublic: question.isPublic || false,
        problemWeight: question.problemWeight || 50,
        testcaseWeight: question.testcaseWeight || 50,
        tags: question.tags || [],
    });
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [showPreview, setShowPreview] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchAvailableTags();
    }, []);

    const fetchAvailableTags = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tags`,{
                withCredentials: true
            });
            const tags = response.data.data;
            setAvailableTags(tags.map((tag: any) => tag.name));
        } catch (error) {
            console.error('Error fetching tags:', error);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        onDataChange();
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await onSave(formData);
        } finally {
            setIsLoading(false);
        }
    };

    const addTag = (tag: string) => {
        if (!formData.tags.includes(tag)) {
            handleChange('tags', [...formData.tags, tag]);
        }
    };

    const removeTag = (tagToRemove: string) => {
        handleChange('tags', formData.tags.filter((tag: string) => tag !== tagToRemove));
    };

    return (
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
                            {formData.tags.map((tag: string) => (
                                <span
                                    key={tag}
                                    className="bg-blue-100 text-navy-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                >
                                    {tag}
                                    <button
                                        onClick={() => removeTag(tag)}
                                        className="text-navy-600 hover:text-navy-800"
                                        type="button"
                                    >
                                        x
                                    </button>
                                </span>
                            ))}
                        </div>
                        <Select
                            placeholder="Add a tag..."
                            onChange={(value) => addTag(value)}
                            options={availableTags
                                .filter(tag => !formData.tags.includes(tag))
                                .map(tag => ({ value: tag, label: tag }))}
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
                                onClick={() => setShowPreview(!showPreview)}
                            >
                                {showPreview ? 'Edit' : 'Preview'}
                            </Button>
                        </div>
                        {showPreview ? (
                            <MarkdownPreview content={formData.problemStatement} />
                        ) : (
                            <textarea
                                value={formData.problemStatement}
                                onChange={(e) => handleChange('problemStatement', e.target.value)}
                                rows={8}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                                placeholder="Write your problem statement in markdown..."
                            />
                        )}
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Constraints
                            </label>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowPreview(!showPreview)}
                            >
                                {showPreview ? 'Edit' : 'Preview'}
                            </Button>
                        </div>
                        {showPreview ? (
                            <MarkdownPreview content={formData.constraints} />
                        ) : (
                            <textarea
                                value={formData.constraints}
                                onChange={(e) => handleChange('constraints', e.target.value)}
                                rows={4}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                                placeholder="Write constraints in markdown..."
                            />
                        )}
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
    );
};

export default QuestionDetailsTab;