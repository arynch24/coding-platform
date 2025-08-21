'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function CreateContestPage() {
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            setError('Contest title is required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contests`, {
                credentials: 'include',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title }),
            });

            if (!response.ok) {
                throw new Error('Failed to create contest');
            }

            const data = await response.json();
            const contestId = data.data.contestDetail.id;

            // Redirect to edit page
            router.push(`teacher/contest/${contestId}/edit`);
        } catch (err) {
            setError('Failed to create contest. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-md mx-auto">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Contest</h1>
                        <p className="text-gray-600">Start by giving your contest a title</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contest Title
                        </label>
                        <Input
                            required
                            placeholder="Enter contest title..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />

                        {error && (
                            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => router.back()}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex-1"
                            >
                                {loading ? 'Creating...' : 'Create & Continue'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}