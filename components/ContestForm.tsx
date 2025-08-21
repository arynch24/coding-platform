'use client';

import { useState, useEffect, use } from 'react';
import { ChevronLeft, Plus, User, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Input } from './ui/Input';
import { Textarea } from './ui/TextArea';
import { Contest } from '@/types/dashboard';
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
    designation: string;
}

// Utility functions for timezone conversion
const convertUTCToIST = (utcDateString: string): string => {
    if (!utcDateString) return '';

    // Create a date object from UTC string (this will be in UTC)
    const utcDate = new Date(utcDateString);

    // Get the UTC timestamp and add 5.5 hours (330 minutes) for IST
    const istTimestamp = utcDate.getTime() + (5.5 * 60 * 60 * 1000);
    const istDate = new Date(istTimestamp);

    // Format for datetime-local input (YYYY-MM-DDTHH:MM)
    // We need to format it manually to avoid timezone issues
    const year = istDate.getUTCFullYear();
    const month = String(istDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(istDate.getUTCDate()).padStart(2, '0');
    const hours = String(istDate.getUTCHours()).padStart(2, '0');
    const minutes = String(istDate.getUTCMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const convertISTToUTC = (istDateString: string): string => {
    if (!istDateString) return '';

    // Parse the datetime-local value as if it's IST
    // datetime-local gives us "2024-01-15T16:00" format
    const [datePart, timePart] = istDateString.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);

    // Create date in IST by manually setting UTC values and subtracting IST offset
    // This treats the input as IST time
    const istDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));

    // Convert IST to UTC by subtracting 5.5 hours
    const utcTimestamp = istDate.getTime() - (5.5 * 60 * 60 * 1000);
    const utcDate = new Date(utcTimestamp);

    return utcDate.toISOString();
};

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
        startTime: '', // This will store IST time for display
        endTime: '',   // This will store IST time for display
        moderators: [] as string[],
        subjectId: ''
    });

    // Available options from APIs
    const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);
    const [availableTags, setAvailableTags] = useState<TagItem[]>([]);
    const [availableBatches, setAvailableBatches] = useState<Batch[]>([]);
    const [availableModerators, setAvailableModerators] = useState<Moderator[]>([]);
    const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);

    // Selected items for display
    const [selectedLanguages, setSelectedLanguages] = useState<Language[]>([]);
    const [selectedTags, setSelectedTags] = useState<TagItem[]>([]);
    const [selectedBatches, setSelectedBatches] = useState<Batch[]>([]);
    const [selectedModerators, setSelectedModerators] = useState<Moderator[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

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
                // Convert UTC times from backend to IST for display
                startTime: convertUTCToIST(initialData.startTime),
                endTime: convertUTCToIST(initialData.endTime),
                moderators: initialData.contestModerators.map(mod => mod.id),
                subjectId: initialData.subject?.id || '',
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
        setSelectedSubject(availableSubjects.find(sub => sub.id === formData.subjectId) || null);
    }, [
        formData.languages, formData.topics, formData.batches, formData.moderators, formData.subjectId,
        availableLanguages, availableTags, availableBatches, availableModerators, availableSubjects
    ]);

    const fetchAvailableOptions = async () => {
        try {
            const [languagesRes, tagsRes, batchesRes, moderatorsRes, subjectsRes] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/languages`, { withCredentials: true }),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tags`, { withCredentials: true }),
                axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teachers/batches`, { withCredentials: true }),
                axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teachers/assistant-teachers`, { withCredentials: true }),
                axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teachers/subjects`, { withCredentials: true }),
            ]);

            setAvailableLanguages(languagesRes.data.data.languages || languagesRes.data.data);
            setAvailableTags(tagsRes.data.data.tags || tagsRes.data.data);
            setAvailableBatches(batchesRes.data.data.batches || batchesRes.data.data);
            setAvailableModerators(moderatorsRes.data.data.assistant_teachers || moderatorsRes.data.data);
            setAvailableSubjects(subjectsRes.data.data.subjects || subjectsRes.data.data);
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
                // Convert UTC times from backend to IST for display
                startTime: convertUTCToIST(contest.startTime),
                endTime: convertUTCToIST(contest.endTime),
                moderators: contest.contestModerators.map((mod: any) => mod.id),
                subjectId: contest.subject?.id || ''
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

        // Validate times in IST context
        const startTimeIST = new Date(formData.startTime);
        const endTimeIST = new Date(formData.endTime);

        if (startTimeIST >= endTimeIST) {
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
                // Convert IST times to UTC before sending to backend
                startTime: convertISTToUTC(formData.startTime),
                endTime: convertISTToUTC(formData.endTime),
                batches: formData.batches,
                topics: formData.topics,
                languages: formData.languages,
                moderators: formData.moderators,
                subjectId: formData.subjectId
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
                                {/* Show additional info for moderators */}
                                {type === 'moderators' ? (
                                    <div className="flex flex-col text-left">
                                        <span className="font-medium">{item.name}</span>
                                        <span className="text-xs text-gray-600">{item.email}</span>
                                        <span className="text-xs text-gray-500">{item.designation}</span>
                                    </div>
                                ) : (
                                    item.name
                                )}
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
                                label: type === 'moderators'
                                    ? `${item.name} (${item.email}) - ${item.designation}`
                                    : item.name
                            }))
                        ]}
                        placeholder={`Add ${label.toLowerCase()}`}
                    />
                )}
            </div>
        );
    };

    const renderSubjectSelection = () => {
        return (
            <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">
                    Subject <span className="text-red-500">*</span>
                </label>

                {/* Show selected subject */}
                {selectedSubject && mode === 'view' && (
                    <div className="mb-2">
                        <Tag variant="default">
                            {selectedSubject.name}
                        </Tag>
                    </div>
                )}

                {/* Subject dropdown for edit mode */}
                {mode === 'edit' && (
                    <Select
                        value={formData.subjectId}
                        onChange={(value) => setFormData({ ...formData, subjectId: value })}
                        options={[
                            { value: '', label: 'Select subject...' },
                            ...availableSubjects.map(subject => ({
                                value: subject.id,
                                label: subject.name
                            }))
                        ]}
                        placeholder="Choose a subject"
                    />
                )}

                {/* Show selected subject as tag in edit mode */}
                {selectedSubject && mode === 'edit' && (
                    <div className="mt-2">
                        <Tag
                            variant="removable"
                            onRemove={() => setFormData({ ...formData, subjectId: '' })}
                        >
                            {selectedSubject.name}
                        </Tag>
                    </div>
                )}
            </div>
        );
    };

    const renderModeratorsSection = () => {
        const unselectedModerators = availableModerators.filter(
            mod => !formData.moderators.includes(mod.id)
        );

        return (
            <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-3">
                    Moderators <span className="text-red-500">*</span>
                </label>

                {/* Selected moderators */}
                {selectedModerators.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                        {selectedModerators.map((moderator) => (
                            <div
                                key={moderator.id}
                                className="bg-blue-50 border border-blue-200 rounded-lg p-3 relative group"
                            >
                                {/* Remove button for edit mode */}
                                {mode === 'edit' && (
                                    <button
                                        onClick={() => handleRemoveItem('moderators', moderator.id)}
                                        className="absolute top-2 right-2 w-5 h-5 bg-gray-200  rounded-full flex items-center justify-center text-xs hover:bg-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3 text-gray-600" />
                                    </button>
                                )}

                                <div className="space-y-1">
                                    <div className="font-medium text-gray-900 pr-6">
                                        {moderator.name}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {moderator.email}
                                    </div>
                                    <div className="text-xs text-blue-600 font-medium bg-blue-100 px-2 py-1 rounded inline-block">
                                        {moderator.designation}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add new moderator dropdown */}
                {mode === 'edit' && unselectedModerators.length > 0 && (
                    <div className="max-w-md">
                        <Select
                            value=""
                            onChange={(value) => handleSelectItem('moderators', value)}
                            options={[
                                { value: '', label: 'Select moderator...' },
                                ...unselectedModerators.map(moderator => ({
                                    value: moderator.id,
                                    label: `${moderator.name} (${moderator.email}) - ${moderator.designation}`
                                }))
                            ]}
                            placeholder="Add moderator"
                        />
                    </div>
                )}

                {selectedModerators.length === 0 && (
                    <div className="text-gray-500 text-sm italic">
                        No moderators selected
                    </div>
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

                        {/* Row 1: Subject (full width) */}
                        <div className="grid grid-cols-1 gap-6">
                            {renderSubjectSelection()}
                        </div>

                        {/* Row 2: Batches, Languages, Topics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {renderSelectableItems('batches', availableBatches, selectedBatches, 'Batches')}
                            {renderSelectableItems('languages', availableLanguages, selectedLanguages, 'Languages')}
                            {renderSelectableItems('topics', availableTags, selectedTags, 'Topics')}
                        </div>

                        {/* Row 3: Moderators */}
                        <div className="grid grid-cols-1 gap-6">
                            {renderModeratorsSection()}
                        </div>

                        {/* Row 4: Start Time, End Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Start Time (IST) <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    required
                                    type="datetime-local"
                                    value={formData.startTime}
                                    onChange={(value) => setFormData({ ...formData, startTime: typeof value === 'string' ? value : value.target.value })}
                                    disabled={mode === 'view'}
                                />
                                <p className="text-xs text-gray-500 mt-1">Indian Standard Time</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    End Time (IST) <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    required
                                    type="datetime-local"
                                    value={formData.endTime}
                                    onChange={(value) => setFormData({ ...formData, endTime: typeof value === 'string' ? value : value.target.value })}
                                    disabled={mode === 'view'}
                                />
                                <p className="text-xs text-gray-500 mt-1">Indian Standard Time</p>
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