"use client";

import  { useState, useEffect } from 'react';
import { Upload, X, Edit, Save, Plus } from 'lucide-react';
import TagInput from '@/components/teacher/TagInput';
import Input from '@/components/teacher/Input';
import TextArea from '@/components/teacher/TextArea';
import { TestCase } from '@/types/dashboard';
import TestCaseDisplay from '@/components/teacher/TestCaseDisplay';
import FileUpload from '@/components/teacher/FileUpload';

interface QuestionData {
  id?: string;
  title: string;
  points: string;
  description: string;
  sampleTestCases: string;
  constraints: string;
  tags: string[];
  testCases: TestCase[];
}

interface QuestionsTestCasesProps {
  initialData?: QuestionData;
  onSave?: (data: QuestionData) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
}

// Tab Component
interface TabProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Tabs: React.FC<TabProps> = ({ tabs, activeTab, onTabChange }) => (
  <div className="flex border border-gray-300 rounded-lg overflow-hidden">
    {tabs.map((tab) => (
      <button
        key={tab}
        onClick={() => onTabChange(tab)}
        className={`flex-1 px-6 py-3 text-center transition-colors ${
          activeTab === tab
            ? 'bg-qc-dark text-white'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        {tab}
      </button>
    ))}
  </div>
);

// Main Component
const QuestionsTestCases: React.FC<QuestionsTestCasesProps> = ({ 
  initialData, 
  onSave, 
  onCancel, 
  mode = 'create' 
}) => {
  const [activeTab, setActiveTab] = useState('Question');
  const [isEditing, setIsEditing] = useState(mode === 'create');
  
  const [questionData, setQuestionData] = useState<QuestionData>(
    initialData || {
      title: '',
      points: '',
      description: '',
      sampleTestCases: '',
      constraints: '',
      tags: [],
      testCases: [],
    }
  );

  const [originalData, setOriginalData] = useState<QuestionData>(questionData);

  useEffect(() => {
    if (initialData) {
      setQuestionData(initialData);
      setOriginalData(initialData);
      setIsEditing(mode === 'create');
    }
  }, [initialData, mode]);

  const handleSave = () => {
    if (onSave) {
      onSave(questionData);
    }
    setOriginalData(questionData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (mode === 'create' && onCancel) {
      onCancel();
    } else {
      setQuestionData(originalData);
      setIsEditing(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleTestCasesUpload = (uploadedTestCases: TestCase[]) => {
    setQuestionData({ ...questionData, testCases: uploadedTestCases });
  };

  const isFormValid = questionData.title.trim() && questionData.points.trim() && 
                     questionData.description.trim() && questionData.testCases.length > 0;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? 'Create Question & Test Cases' : 'Question & Test Cases'}
          </h1>
          {mode === 'edit' && !isEditing && (
            <button 
              onClick={handleEdit}
              className="p-1 text-gray-500 hover:text-gray-700"
            >
              <Edit size={16} />
            </button>
          )}
        </div>
        
        {isEditing && (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              <X size={16} />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!isFormValid}
              className={`flex items-center gap-1 px-4 py-2 rounded-md transition-colors ${
                isFormValid
                  ? 'bg-blue-900 text-white hover:bg-blue-800'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Save size={16} />
              Save
            </button>
          </div>
        )}
      </div>
      
      <p className="text-gray-600 mb-6">
        Fill all necessary fields properly & don't forget to upload test cases{' '}
        <span className="text-red-500">*</span>
      </p>

      <div className="mb-6">
        <Tabs 
          tabs={['Question', 'Test Cases']} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
      </div>

      {activeTab === 'Question' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Title"
              value={questionData.title}
              onChange={(value) => setQuestionData({ ...questionData, title: value })}
              placeholder="Enter question title"
              required
              disabled={!isEditing}
            />
            <Input
              label="Points"
              value={questionData.points}
              onChange={(value) => setQuestionData({ ...questionData, points: value })}
              placeholder="Enter points"
              required
              type="number"
              disabled={!isEditing}
            />
            <TagInput
              tags={questionData.tags}
              onTagsChange={(tags) => setQuestionData({ ...questionData, tags })}
              disabled={!isEditing}
            />
          </div>

          <TextArea
            label="Description"
            value={questionData.description}
            onChange={(value) => setQuestionData({ ...questionData, description: value })}
            placeholder="Enter the problem description with examples, input/output format, etc."
            required
            rows={8}
            disabled={!isEditing}
          />

          <TextArea
            label="Sample Test Cases"
            value={questionData.sampleTestCases}
            onChange={(value) => setQuestionData({ ...questionData, sampleTestCases: value })}
            placeholder="Provide sample input and output examples"
            required
            rows={6}
            disabled={!isEditing}
          />

          <TextArea
            label="Constraints"
            value={questionData.constraints}
            onChange={(value) => setQuestionData({ ...questionData, constraints: value })}
            placeholder="Enter constraints like time limits, value ranges, etc."
            required
            rows={4}
            disabled={!isEditing}
          />
        </div>
      )}

      {activeTab === 'Test Cases' && (
        <div className="space-y-6">
          {isEditing ? (
            <FileUpload onUpload={handleTestCasesUpload} />
          ) : (
            <TestCaseDisplay 
              testCases={questionData.testCases} 
              onEdit={() => setActiveTab('Test Cases')} 
              editable={mode === 'edit'}
            />
          )}
          
          {questionData.testCases.length > 0 && (
            <div className="mt-4">
              <TestCaseDisplay 
                testCases={questionData.testCases} 
                editable={false}
              />
            </div>
          )}
        </div>
      )}

      {!isEditing && mode === 'edit' && (
        <div className="flex justify-end mt-8">
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-6 py-2 bg-qc-dark text-white rounded-md hover:bg-qc-dark/90 transition-colors"
          >
            <Edit size={16} />
            Edit Question
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestionsTestCases;