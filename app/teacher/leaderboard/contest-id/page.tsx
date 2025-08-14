"use client";

import { useState, useEffect } from 'react';
import Button from '@/components/Button';
import { Modal, ActionsModal, ActionButton } from '@/components/Modal';
import LoadingSpinner from '@/components/Loader';
import ErrorMessage from '@/components/ErrorBox';
import { ActionData, Exam, Student } from '@/types/dashboard';

const LeaderboardPage = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    // Mock exam data
    const exam: Exam = {
        id: '1',
        title: 'DSA Sprint Exam #1',
        description: 'Data structures and algorithms - Arrays & Strings',
        dateTime: '7/30/2025, 11:30:30',
        participants: 120,
        status: 'Published'
    };

    // Mock API call to fetch leaderboard data
    const fetchLeaderboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            const mockStudents: Student[] = [
                {
                    id: '1',
                    rank: 1,
                    name: 'Ram Ramesh',
                    email: 'ram.sot0043@pwlol.com',
                    obtainedScore: 250,
                    solvedQuestions: '5/9'
                },
                {
                    id: '2',
                    rank: 2,
                    name: 'Purnand Ware',
                    email: 'purnand.sot0044@pwlol.com',
                    obtainedScore: 241,
                    solvedQuestions: '4/9'
                },
                {
                    id: '3',
                    rank: 3,
                    name: 'Arjun Mishra',
                    email: 'arjun.sot0045@pwlol.com',
                    obtainedScore: 210,
                    solvedQuestions: '3/9'
                },
                {
                    id: '4',
                    rank: 4,
                    name: 'Ayush Gautam',
                    email: 'ayush.sot0046@pwlol.com',
                    obtainedScore: 200,
                    solvedQuestions: '2/9'
                },
                {
                    id: '5',
                    rank: 5,
                    name: 'Priya Sharma',
                    email: 'priya.sot0047@pwlol.com',
                    obtainedScore: 195,
                    solvedQuestions: '2/9'
                },
                {
                    id: '6',
                    rank: 6,
                    name: 'Rohit Kumar',
                    email: 'rohit.sot0048@pwlol.com',
                    obtainedScore: 180,
                    solvedQuestions: '2/9'
                }
            ];

            setStudents(mockStudents);
        } catch (err) {
            setError('Failed to load leaderboard data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaderboardData();
    }, []);

    const handleActionClick = (student: Student) => {
        setSelectedStudent(student);
        setIsModalOpen(true);
    };

    const handleActionSave = async (data: ActionData) => {
        try {
            console.log('Action saved for student:', selectedStudent?.name, data);
            // In a real app, you would make an API call here
        } catch (err) {
            console.error('Failed to save action:', err);
        }
    };

    const handleRetry = () => {
        fetchLeaderboardData();
    };

    const handlePublish = () => {
        // Logic to publish the exam
        console.log('Exam published:', exam.title);
    }
    const handleUnpublish = () => {
        // Logic to unpublish the exam
        console.log('Exam unpublished:', exam.title);
    }

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{exam.title} - Leaderboard</h1>
                    <p className="text-gray-600 mb-2">{exam.description}</p>
                    <div className="flex gap-4 text-sm text-gray-500">
                        <span>📅 {exam.dateTime}</span>
                        <span>👥 {exam.participants} participants</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="primary"
                        onClick={exam.status === 'Published' ? handleUnpublish : handlePublish}
                        disabled={loading}
                    >
                        {exam.status === 'Published' ? 'Unpublish Exam' : 'Publish Exam'}
                    </Button>
                </div>
            </div>

            {/* Content */}
            {loading && <LoadingSpinner />}

            {error && (
                <ErrorMessage message={error} onRetry={handleRetry} />
            )}

            {!loading && !error && students.length > 0 && (
                <div className="bg-gray-100 rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-200 text-left">
                                <th className="p-4 font-medium text-gray-700">Rank</th>
                                <th className="p-4 font-medium text-gray-700">Student</th>
                                <th className="p-4 font-medium text-gray-700">Score</th>
                                <th className="p-4 font-medium text-gray-700">Questions Solved</th>
                                <th className="p-4 font-medium text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {students.map((student) => (
                                <tr key={student.id} className="border-b border-gray-300 last:border-b-0">
                                    <td className="p-4">
                                        <div className="flex items-center">
                                            <span className="text-lg font-bold text-gray-900 mr-2">#{student.rank}</span>
                                            {student.rank === 1 && <span className="text-yellow-500">🏆</span>}
                                            {student.rank === 2 && <span className="text-gray-400">🥈</span>}
                                            {student.rank === 3 && <span className="text-yellow-600">🥉</span>}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div>
                                            <div className="font-semibold text-gray-900">{student.name}</div>
                                            <div className="text-sm text-gray-600">{student.email}</div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-lg font-bold text-blue-600">{student.obtainedScore}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-medium text-gray-900">{student.solvedQuestions}</span>
                                    </td>
                                    <td className="p-4">
                                        <ActionButton onClick={() => handleActionClick(student)} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && !error && students.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-gray-600">No students found for this exam.</p>
                </div>
            )}

            {/* Actions Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                {selectedStudent && (
                    <ActionsModal
                        studentName={selectedStudent.name}
                        onSave={handleActionSave}
                        onClose={() => setIsModalOpen(false)}
                    />
                )}
            </Modal>
        </div>
    );
};

export default LeaderboardPage;