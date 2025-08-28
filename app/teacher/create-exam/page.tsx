"use client";

import { useState } from 'react';
import { ChevronLeft, Plus, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";

// Reusable Button Component
interface ButtonProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    onClick?: () => void;
    className?: string;
    type?: 'button' | 'submit';
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    onClick,
    className = '',
    type = 'button'
}) => {
    const baseClasses = 'font-medium rounded-lg transition-colors duration-200 flex items-center justify-center';

    const variants = {
        primary: 'bg-slate-700 text-white hover:bg-slate-800',
        secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
        ghost: 'bg-transparent text-gray-600 hover:bg-gray-100'
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base'
    };

    return (
        <button
            type={type}
            onClick={onClick}
            className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
        >
            {children}
        </button>
    );
};

// Reusable Input Component
interface InputProps {
    label: string;
    required?: boolean;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    type?: 'text' | 'date' | 'time' | 'number';
    className?: string;
}

const Input: React.FC<InputProps> = ({
    label,
    required = false,
    placeholder,
    value,
    onChange,
    type = 'text',
    className = ''
}) => {
    return (
        <div className={`flex flex-col ${className}`}>
            <label className="text-sm font-medium text-gray-700 mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
        </div>
    );
};

// Reusable Textarea Component
interface TextareaProps {
    label: string;
    required?: boolean;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    rows?: number;
    className?: string;
}

const Textarea: React.FC<TextareaProps> = ({
    label,
    required = false,
    placeholder,
    value,
    onChange,
    rows = 4,
    className = ''
}) => {
    return (
        <div className={`flex flex-col ${className}`}>
            <label className="text-sm font-medium text-gray-700 mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <textarea
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={rows}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none"
            />
        </div>
    );
};

// Reusable Select Component
interface SelectProps {
    label: string;
    required?: boolean;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
    className?: string;
}

const Select: React.FC<SelectProps> = ({
    label,
    required = false,
    value,
    onChange,
    options,
    placeholder = 'Select',
    className = ''
}) => {
    return (
        <div className={`flex flex-col ${className}`}>
            <label className="text-sm font-medium text-gray-700 mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent appearance-none"
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

// Reusable Tag Component
interface TagProps {
    children: React.ReactNode;
    onRemove?: () => void;
    variant?: 'default' | 'removable';
}

const Tag: React.FC<TagProps> = ({ children, onRemove, variant = 'default' }) => {
    return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-700">
            {children}
            {variant === 'removable' && onRemove && (
                <button
                    onClick={onRemove}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                >
                    ×
                </button>
            )}
        </span>
    );
};

// Main CreateNewExam Component
const CreateNewExam: React.FC = () => {
    const [formData, setFormData] = useState({
        title: '',
        batch: 'All Batches',
        description: '',
        topics: ['Array', 'Stack'],
        language: '',
        subject: '',
        date: '',
        time: '',
        duration: ''
    });

    const [moderators, setModerators] = useState<string[]>([]);

    const batchOptions = [
        { value: 'All Batches', label: 'All Batches' },
        { value: 'Batch A', label: 'Batch A' },
        { value: 'Batch B', label: 'Batch B' },
        { value: 'Batch C', label: 'Batch C' }
    ];

    const languageOptions = [
        { value: 'javascript', label: 'JavaScript' },
        { value: 'python', label: 'Python' },
        { value: 'java', label: 'Java' },
        { value: 'cpp', label: 'C++' }
    ];

    const subjectOptions = [
        { value: 'data-structures', label: 'Data Structures' },
        { value: 'algorithms', label: 'Algorithms' },
        { value: 'web-development', label: 'Web Development' },
        { value: 'database', label: 'Database' }
    ];

    const handleSubmit = () => {
        console.log('Form submitted:', formData);
        toast.success('Exam created successfully!');
    };

    const addModerator = () => {
        const moderatorName = prompt('Enter moderator name:');
        if (moderatorName && !moderators.includes(moderatorName)) {
            setModerators([...moderators, moderatorName]);
        }
    };

    const removeTopic = (topicToRemove: string) => {
        setFormData({
            ...formData,
            topics: formData.topics.filter(topic => topic !== topicToRemove)
        });
    };

    const addTopic = () => {
        const newTopic = prompt('Enter new topic:');
        if (newTopic && !formData.topics.includes(newTopic)) {
            setFormData({
                ...formData,
                topics: [...formData.topics, newTopic]
            });
        }
    };

    const router = useRouter();

    return (
        <div className="">
            <div className="max-w-5xl mx-auto p-8">
                {/* Header */}
                <div className="flex items-center mb-8">
                    <Button variant="ghost" className="mr-4 p-2"
                        onClick={router.back}>
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Create New Exam</h1>
                        <p className="text-gray-600 text-sm mt-1">Set up a new exam for students</p>
                    </div>
                </div>

                {/* Form */}
                <div className="space-y-6">
                    {/* Row 1: Title, Batch, Moderators */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Input
                            label="Exam Title"
                            required
                            placeholder="Enter exam title..."
                            value={formData.title}
                            onChange={(value) => setFormData({ ...formData, title: value })}
                        />

                        <Select
                            label="Batch"
                            required
                            value={formData.batch}
                            onChange={(value) => setFormData({ ...formData, batch: value })}
                            options={batchOptions}
                        />

                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-2">
                                Moderators
                            </label>
                            <Button
                                variant="secondary"
                                onClick={addModerator}
                                className="self-start"
                            >
                                <User className="w-4 h-4 mr-2" />
                                Add moderator
                            </Button>
                            {moderators.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {moderators.map((moderator, index) => (
                                        <Tag key={index}>{moderator}</Tag>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <Textarea
                        label="Description"
                        required
                        placeholder="describe the exam and it's objective..."
                        value={formData.description}
                        onChange={(value) => setFormData({ ...formData, description: value })}
                        rows={4}
                    />

                    {/* Row 2: Topics, Language, Subject */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-2">
                                Topics <span className="text-red-500">*</span>
                            </label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {formData.topics.map((topic, index) => (
                                    <Tag
                                        key={index}
                                        variant="removable"
                                        onRemove={() => removeTopic(topic)}
                                    >
                                        {topic}
                                    </Tag>
                                ))}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={addTopic}
                                    className="border border-dashed border-gray-300 text-gray-500"
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <Select
                            label="Language"
                            required
                            value={formData.language}
                            onChange={(value) => setFormData({ ...formData, language: value })}
                            options={languageOptions}
                            placeholder="Select"
                        />

                        <Select
                            label="Subject"
                            required
                            value={formData.subject}
                            onChange={(value) => setFormData({ ...formData, subject: value })}
                            options={subjectOptions}
                            placeholder="Select"
                        />
                    </div>

                    {/* Row 3: Date, Time, Duration */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Input
                            label="Date"
                            required
                            type="date"
                            placeholder="dd-mm-yyyy"
                            value={formData.date}
                            onChange={(value) => setFormData({ ...formData, date: value })}
                        />

                        <Input
                            label="Time"
                            required
                            type="time"
                            placeholder="--:--"
                            value={formData.time}
                            onChange={(value) => setFormData({ ...formData, time: value })}
                        />

                        <Input
                            label="Duration (in minutes)"
                            required
                            type="number"
                            placeholder="---"
                            value={formData.duration}
                            onChange={(value) => setFormData({ ...formData, duration: value })}
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-6">
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={handleSubmit}
                            type="submit"
                        >
                            Create
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateNewExam;