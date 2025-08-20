"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Tabs } from '@/components/ui/Tabs';
import { QuestionDetailsTab } from '@/components/questions/QuestionDetailsTab';
import { CodeStubsTab } from '@/components/questions/CodeStubsTab';
import { ModeratorsTab } from '@/components/questions/ModeratorsTab';
import { TestCasesTab } from '@/components/questions/TestCasesTab';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import axios from 'axios';

interface Question {
  id: string;
  title: string;
  constraints?: string;
  problemStatement?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  isPublic: boolean;
  problemWeight: number;
  testcaseWeight: number;
  tags: string[];
}
const QuestionEditorPage: React.FC = () => {
  const params = useParams();
  const questionId = params.questionId as string;
  const [activeTab, setActiveTab] = useState(0);
  const [question, setQuestion] = useState<Question | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingTab, setPendingTab] = useState<number | null>(null);

  useEffect(() => {
    if (questionId) {
      fetchQuestion();
    }
  }, [questionId]);

  const fetchQuestion = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/problems/${questionId}`, 
        {
          withCredentials: true
        }
      );
      setQuestion(response.data.data.problem);
    } catch (error) {
      console.error('Error fetching question:', error);
    }
  };

  const handleTabChange = (tabIndex: number) => {
    if (hasUnsavedChanges) {
      setPendingTab(tabIndex);
      setShowUnsavedModal(true);
    } else {
      setActiveTab(tabIndex);
    }
  };

  const handleSaveDetailsChanges = async (details: any) => {
    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/problems/${questionId}`,
        { ...details },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving details changes:', error);
    }
  };

  const handleSaveChanges = async (tabData: any) => {
    try {
      const response = await fetch(`/api/questions/${questionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tabData),
      });

      if (response.ok) {
        setHasUnsavedChanges(false);
        if (pendingTab !== null) {
          setActiveTab(pendingTab);
          setPendingTab(null);
          setShowUnsavedModal(false);
        }
      }
    } catch (error) {
      console.error('Error saving changes:', error);
    }
  };

  const tabs = [
    { label: 'Details', id: 'details' },
    { label: 'Code Stubs', id: 'code-stubs' },
    { label: 'Moderators', id: 'moderators' },
    { label: 'Test Cases', id: 'testcases' },
  ];

  if (!question) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">{question.title}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        <div className="mt-6">
          {activeTab === 0 && (
            <QuestionDetailsTab
              question={question}
              onSave={handleSaveDetailsChanges}
              onDataChange={() => setHasUnsavedChanges(true)}
            />
          )}
          {activeTab === 1 && (
            <CodeStubsTab
              questionId={question.id}
              onSave={handleSaveChanges}
              onDataChange={() => setHasUnsavedChanges(true)}
            />
          )}
          {activeTab === 2 && (
            <ModeratorsTab
              questionId={question.id}
              onSave={handleSaveChanges}
              onDataChange={() => setHasUnsavedChanges(true)}
            />
          )}
          {activeTab === 3 && (
            <TestCasesTab
              questionId={question.id}
              onDataChange={() => setHasUnsavedChanges(true)}
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={showUnsavedModal}
        onClose={() => setShowUnsavedModal(false)}
        title="Unsaved Changes"
      >
        <p className="text-gray-600 mb-4">
          You have unsaved changes. Please save your changes before switching tabs.
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => setShowUnsavedModal(false)}
          >
            Stay on Current Tab
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default QuestionEditorPage;