// pages/questions/create/index.tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import axios from 'axios';

const CreateQuestionPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreateQuestion = async () => {
    if (!title.trim()) return;

    setIsLoading(true);
    try {

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/problems`, {
        title: title.trim()
      },{
        withCredentials: true
      });

      if (response.status === 200) {
        router.push(`/questions/${response.data.questionId}`);
      }
    } catch (error) {
      console.error('Error creating question:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Create New Question
        </h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter question title..."
              className="w-full"
            />
          </div>

          <Button
            onClick={handleCreateQuestion}
            disabled={!title.trim() || isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Creating...' : 'Create Question'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateQuestionPage;

// pages/questions/[questionId]/index.tsx


// components/questions/QuestionDetailsTab.tsx



// components/questions/ModeratorsTab.tsx

// components/questions/CodeStubsTab.tsx


// Add Code Stub Modal Component


// components/questions/AddTestCaseModal.tsx


// components/questions/MarkdownPreview.tsx


// components/ui/Button.tsx


// components/ui/Input.tsx


// components/ui/Select.tsx


// components/ui/Tabs.tsx


// components/ui/Modal.tsx

