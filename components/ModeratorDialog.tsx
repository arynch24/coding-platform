// components/ModeratorDialog.tsx
"use client";

import React, { useEffect, useState } from "react";
import { X, UserPlus, Trash2 } from "lucide-react";
import axios from "axios";
import Loader from "@/components/Loader";
import ErrorBox from "@/components/ErrorBox";

interface Teacher {
    id: string;
    name: string;
    email: string;
    designation: string | null;
    moderatorId: string;
}

interface ModeratorDialogProps {
    contestId: string;
    isOpen: boolean;
    onClose: () => void;
}

const ModeratorDialog: React.FC<ModeratorDialogProps> = ({ contestId, isOpen, onClose }) => {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [moderators, setModerators] = useState<Teacher[]>([]);
    const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [adding, setAdding] = useState<boolean>(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Fetch assistant teachers and current moderators
    useEffect(() => {
        if (!isOpen) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch all assistant teachers
                const teachersRes = await axios.get(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teachers/assistant-teachers`,
                    { withCredentials: true }
                );

                const fetchedTeachers: Teacher[] = teachersRes.data.data.assistant_teachers.map(
                    (t: any) => ({
                        id: t.id,
                        name: t.name,
                        email: t.email,
                        designation: t.designation || null,
                    })
                );
                setTeachers(fetchedTeachers);

                // Fetch current moderators for this contest
                const moderatorsRes = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/contests/moderators/${contestId}`,
                    { withCredentials: true }
                );

                const fetchedModerators: Teacher[] = moderatorsRes.data.data.moderators.map(
                    (m: any) => ({
                        id: m.id,
                        name: m.name,
                        email: m.email,
                        designation: m.designation || null,
                        moderatorId: m.moderatorId,
                    })
                );
                setModerators(fetchedModerators);
            } catch (err: any) {
                setError(err.response?.data?.message || "Failed to load data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isOpen, contestId]);

    // Add multiple moderators
    const handleAddModerators = async () => {
        if (selectedTeacherIds.length === 0 || adding) return;

        try {
            setAdding(true);
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/contests/moderators/${contestId}`,
                { moderatorIds: selectedTeacherIds }, // Send array
                { withCredentials: true }
            );
            
            const moderatorsRes = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/contests/moderators/${contestId}`,
            { withCredentials: true }
        );

        const fetchedModerators: Teacher[] = moderatorsRes.data.data.moderators.map((m: any) => ({
            id: m.id,
            name: m.name,
            email: m.email,
            designation: m.designation || null,
            moderatorId: m.moderatorId, // Now it's included
        }));

        setModerators(fetchedModerators);
        setSelectedTeacherIds([]);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to add moderators.");
        } finally {
            setAdding(false);
        }
    };

    // Remove a moderator
    const handleRemoveModerator = async (moderatorId: string) => {
        try {
            setDeletingId(moderatorId);
            await axios.delete(
                `${process.env.NEXT_PUBLIC_API_URL}/contests/moderators/${moderatorId}`,
                { withCredentials: true }
            );
            setModerators(prev => prev.filter(m => m.moderatorId !== moderatorId));
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to remove moderator.");
        } finally {
            setDeletingId(null);
        }
    };

    if (!isOpen) return null;

    // Filter available teachers (not already added)
    const availableTeachers = teachers.filter(
        t => !moderators.some(m => m.id === t.id)
    );

    const toggleSelect = (id: string) => {
        setSelectedTeacherIds(prev =>
            prev.includes(id)
                ? prev.filter(tid => tid !== id)
                : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedTeacherIds.length === availableTeachers.length) {
            setSelectedTeacherIds([]);
        } else {
            setSelectedTeacherIds(availableTeachers.map(t => t.id));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Manage Moderators</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {loading ? (
                        <Loader text="Loading moderators..." />
                    ) : error ? (
                        <ErrorBox message={error} onRetry={() => window.location.reload()} />
                    ) : (
                        <div className="space-y-6">
                            {/* Add Moderator Section */}
                            <div>
                                <label className="block font-medium text-gray-800 mb-3">
                                    Add Moderators
                                </label>

                                {availableTeachers.length === 0 ? (
                                    <p className="text-gray-500 text-sm italic">All teachers are already added as moderators.</p>
                                ) : (
                                    <div className="border border-gray-300 rounded-md overflow-hidden">
                                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedTeacherIds.length === availableTeachers.length}
                                                onChange={toggleSelectAll}
                                                className="mr-3"
                                            />
                                            <span className="font-medium text-gray-900">Select All</span>
                                        </div>
                                        <ul className="divide-y divide-gray-200 max-h-48 overflow-y-auto">
                                            {availableTeachers.map((teacher) => (
                                                <li key={teacher.id} className="flex items-center p-3 hover:bg-gray-50">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedTeacherIds.includes(teacher.id)}
                                                        onChange={() => toggleSelect(teacher.id)}
                                                        className="ml-1 mr-3"
                                                    />
                                                    <div>
                                                        <p className="font-medium text-gray-900">{teacher.name}</p>
                                                        <p className="text-sm text-gray-600">
                                                            {teacher.email} • {teacher.designation || "No designation"}
                                                        </p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="mt-3 flex justify-end">
                                    <button
                                        onClick={handleAddModerators}
                                        disabled={selectedTeacherIds.length === 0 || adding}
                                        className="flex items-center gap-1 bg-qc-dark text-white px-4 py-2 rounded-md hover:bg-qc-dark/90 disabled:opacity-50"
                                    >
                                        <UserPlus size={16} />
                                        {adding
                                            ? "Adding..."
                                            : selectedTeacherIds.length > 0
                                                ? `Add ${selectedTeacherIds.length} Moderator(s)`
                                                : "Add"}
                                    </button>
                                </div>
                            </div>

                            {/* Current Moderators List */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    Current Moderators ({moderators.length})
                                </h3>
                                {moderators.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No moderators added yet.</p>
                                ) : (
                                    <ul className="space-y-3">
                                        {moderators.map((mod) => (
                                            <li
                                                key={mod.id}
                                                className="flex items-center justify-between p-3 border border-gray-200 rounded-md bg-gray-50"
                                            >
                                                <div>
                                                    <p className="font-medium text-gray-900">{mod.name}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {mod.email} • {mod.designation || "No designation"}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveModerator(mod.moderatorId)}
                                                    disabled={deletingId === mod.moderatorId}
                                                    className="text-red-600 hover:text-red-800 disabled:opacity-50 flex items-center gap-1"
                                                >
                                                    {deletingId === mod.moderatorId ? (
                                                        "Removing..."
                                                    ) : (
                                                        <>
                                                            <Trash2 size={16} />
                                                            <span>Remove</span>
                                                        </>
                                                    )}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModeratorDialog;