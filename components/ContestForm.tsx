'use client';

import { useState, useEffect, use } from 'react';
import { ChevronLeft, Plus, User, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Input } from './ui/Input';
import { Textarea } from './ui/TextArea';
import { Contest, ContestFormData } from '@/types/dashboard';
import { Tag } from './ui/Tag';

interface ContestFormProps {
    contestId: string | Promise<{ contestId: string }>;
    initialData?: Contest | null;
    mode: 'edit' | 'view';
}

interface Language {
    id: string;
    name: string;
}

interface TagItem {
    id: string;
    name: string;
}

interface Batch {
    id: string;
    name: string;
}

interface Subject {
    id: string;
    name: string;
}

interface Moderator {
    id: string;
    name: string;
    email: string;
}

const ContestForm: React.FC<ContestFormProps> = ({ contestId: contestIdParam, initialData, mode }) => {
    // Unwrap contestId if it's a Promise (Next.js 15+)
    const contestId = typeof contestIdParam === 'string' 
        ? contestIdParam 
        : use(contestIdParam).contestId;
    const [formData, setFormData] = useState({
        title: '',
        batches: [] as string[],
        description: '',
        topics: [] as string[],
        languages: [] as string[],
        startTime: '',
        endTime: '',
        moderators: [] as string[]
    });

    // Available options from APIs
    const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);
    const [availableTags, setAvailableTags] = useState<TagItem[]>([]);
    const [availableBatches, setAvailableBatches] = useState<Batch[]>([]);
    const [availableModerators, setAvailableModerators] = useState<Moderator[]>([]);

    // Selected items for display
    const [selectedLanguages, setSelectedLanguages] = useState<Language[]>([]);
    const [selectedTags, setSelectedTags] = useState<TagItem[]>([]);
    const [selectedBatches, setSelectedBatches] = useState<Batch[]>([]);
    const [selectedModerators, setSelectedModerators] = useState<Moderator[]>([]);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    // Fetch all available options on component mount
    useEffect(() => {
        fetchAvailableOptions();
    }, []);

    // Update form data when initial data is provided
    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title,
                batches: initialData.batchContests.map(batch => batch.id),
                description: initialData.description,
                topics: initialData.tags.map(tag => tag.id),
                languages: initialData.allowedLanguages.map(lang => lang.id),
                startTime: new Date(initialData.startTime).toISOString().slice(0, 16),
                endTime: new Date(initialData.endTime).toISOString().slice(0, 16),
                moderators: initialData.contestModerators.map(mod => mod.id)
            });
        } else if (contestId !== 'new') {
            fetchContestData();
        }
    }, [initialData, contestId]);

    // Update selected items when form data changes
    useEffect(() => {
        setSelectedLanguages(availableLanguages.filter(lang => formData.languages.includes(lang.id)));
        setSelectedTags(availableTags.filter(tag => formData.topics.includes(tag.id)));
        setSelectedBatches(availableBatches.filter(batch => formData.batches.includes(batch.id)));
        setSelectedModerators(availableModerators.filter(mod => formData.moderators.includes(mod.id)));
    }, [
        formData.languages, formData.topics, formData.batches, formData.moderators,
        availableLanguages, availableTags, availableBatches, availableModerators
    ]);

    const fetchAvailableOptions = async () => {
        try {
            const [languagesRes, tagsRes, batchesRes, moderatorsRes] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/languages`, { withCredentials: true }),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tags`, { withCredentials: true }),
                axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teachers/batches`, { withCredentials: true }),
                axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teachers/assistant-teachers`, { withCredentials: true })
            ]);

            setAvailableLanguages(languagesRes.data.data.languages || languagesRes.data.data);
            setAvailableTags(tagsRes.data.data.tags || tagsRes.data.data);
            setAvailableBatches(batchesRes.data.data.batches || batchesRes.data.data);
            setAvailableModerators(moderatorsRes.data.data.assistant_teachers || moderatorsRes.data.data);
        } catch (error) {
            console.error('Error fetching available options:', error);
            setError('Failed to load form options');
        }
    };

    const fetchContestData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/contests/${contestId}`, {
                withCredentials: true,
            });
            
            const contest = response.data.data.contestDetails;

            setFormData({
                title: contest.title,
                batches: contest.batchContests.map((batch: any) => batch.id),
                description: contest.description,
                topics: contest.tags.map((tag: any) => tag.id),
                languages: contest.allowedLanguages.map((lang: any) => lang.id),
                startTime: new Date(contest.startTime).toISOString().slice(0, 16),
                endTime: new Date(contest.endTime).toISOString().slice(0, 16),
                moderators: contest.contestModerators.map((mod: any) => mod.id)
            });
        } catch (err) {
            console.error('Error fetching contest:', err);
            setError('Failed to load contest data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.title.trim()) {
            setError('Contest title is required');
            return;
        }

        if (!formData.startTime || !formData.endTime) {
            setError('Start time and end time are required');
            return;
        }

        if (new Date(formData.startTime) >= new Date(formData.endTime)) {
            setError('End time must be after start time');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const updateData = {
                isOpen: true,
                title: formData.title,
                description: formData.description,
                startTime: new Date(formData.startTime).toISOString(),
                endTime: new Date(formData.endTime).toISOString(),
                batches: formData.batches,
                topics: formData.topics,
                languages: formData.languages,
                moderators: formData.moderators
            };

            await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/contests/${contestId}`, updateData, {
                withCredentials: true
            });

            // Redirect to contest view
            // router.push(`/contests/${contestId}`);
        } catch (err) {
            console.error('Error updating contest:', err);
            setError('Failed to save contest. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleSelectItem = (type: string, itemId: string) => {
        setFormData(prev => ({
            ...prev,
            [type]: [...prev[type as keyof typeof prev] as string[], itemId]
        }));
    };

    const handleRemoveItem = (type: string, itemId: string) => {
        setFormData(prev => ({
            ...prev,
            [type]: (prev[type as keyof typeof prev] as string[]).filter(id => id !== itemId)
        }));
    };

    const renderSelectableItems = (
        type: string,
        availableItems: any[],
        selectedItems: any[],
        label: string
    ) => {
        const unselectedItems = availableItems.filter(
            item => !formData[type as keyof typeof formData].includes(item.id)
        );

        return (
            <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">
                    {label} <span className="text-red-500">*</span>
                </label>
                
                {/* Selected items */}
                {selectedItems.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                        {selectedItems.map((item) => (
                            <Tag
                                key={item.id}
                                variant={mode === 'edit' ? 'removable' : 'default'}
                                onRemove={mode === 'edit' ? () => handleRemoveItem(type, item.id) : undefined}
                            >
                                {item.name}
                            </Tag>
                        ))}
                    </div>
                )}

                {/* Add new item dropdown */}
                {mode === 'edit' && unselectedItems.length > 0 && (
                    <Select
                        value=""
                        onChange={(value) => handleSelectItem(type, value)}
                        options={[
                            { value: '', label: `Select ${label.toLowerCase()}...` },
                            ...unselectedItems.map(item => ({
                                value: item.id,
                                label: item.name
                            }))
                        ]}
                        placeholder={`Add ${label.toLowerCase()}`}
                    />
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading contest data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto p-8">
                {/* Header */}
                <div className="flex items-center mb-8">
                    <Button variant="ghost" className="mr-4 p-2" onClick={() => router.back()}>
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {mode === 'edit' ? 'Edit Contest' : 'Contest Details'}
                        </h1>
                        <p className="text-gray-600 text-sm mt-1">
                            {mode === 'edit' ? 'Update contest information' : 'View contest details'}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 text-red-600 bg-red-50 p-4 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Form */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Contest Title <span className="text-red-500">*</span>
                            </label>
                            <Input
                                required
                                placeholder="Enter contest title..."
                                value={formData.title}
                                onChange={(value) => setFormData({ ...formData, title: typeof value === 'string' ? value : value.target.value })}
                                disabled={mode === 'view'}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <Textarea
                                required
                                placeholder="Describe the contest and its objectives..."
                                value={formData.description}
                                onChange={(value) => setFormData({ ...formData, description: value })}
                                rows={4}
                                disabled={mode === 'view'}
                            />
                        </div>

                        {/* Row 1: Batches, Languages, Topics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {renderSelectableItems('batches', availableBatches, selectedBatches, 'Batches')}
                            {renderSelectableItems('languages', availableLanguages, selectedLanguages, 'Languages')}
                            {renderSelectableItems('topics', availableTags, selectedTags, 'Topics')}
                        </div>

                        {/* Row 2: Moderators */}
                        <div className="grid grid-cols-1 gap-6">
                            {renderSelectableItems('moderators', availableModerators, selectedModerators, 'Moderators')}
                        </div>

                        {/* Row 3: Start Time, End Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Start Time <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    required
                                    type="datetime-local"
                                    value={formData.startTime}
                                    onChange={(value) => setFormData({ ...formData, startTime: typeof value === 'string' ? value : value.target.value })}
                                    disabled={mode === 'view'}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    End Time <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    required
                                    type="datetime-local"
                                    value={formData.endTime}
                                    onChange={(value) => setFormData({ ...formData, endTime: typeof value === 'string' ? value : value.target.value })}
                                    disabled={mode === 'view'}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        {mode === 'edit' && (
                            <div className="flex justify-end pt-6 border-t">
                                <Button
                                    variant="primary"
                                    size="lg"
                                    onClick={handleSubmit}
                                    disabled={saving}
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContestForm;