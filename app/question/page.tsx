"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Play, Upload, Maximize2, RotateCcw, ChevronDown, Plus, GripVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Monaco Editor types and globals
declare global {
  interface Window {
    monaco: any;
    MonacoEnvironment: any;
    require: any;
  }
}

interface Example {
  input: string;
  output: string;
  explanation?: string;
}

interface TestCase {
  id: number;
  name: string;
  input: string;
  output: string;
  expected?: string;
}

interface Language {
  id: number;
  name: string;
  label: string;
  defaultCode: string;
  monacoLanguage: string;
}

interface ProblemData {
  id: number;
  title: string;
  description: string;
  examples: Example[];
  constraints: string[];
  followUp?: string;
  timeRemaining: string;
  testCases: TestCase[];
}

interface TabProps {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}

interface SubmissionResult {
  status: string;
  output?: string;
  error?: string;
  time?: string;
  memory?: string;
}

const Tab: React.FC<TabProps> = ({ label, active, onClick, icon }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 ${active
      ? 'bg-white text-gray-900 shadow-sm'
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
  >
    {icon}
    {label}
  </button>
);

interface TestCaseTabProps {
  testCase: TestCase;
  active: boolean;
  onClick: () => void;
}

const TestCaseTab: React.FC<TestCaseTabProps> = ({ testCase, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-lg ${active
      ? 'bg-white text-gray-900 shadow-sm'
      : 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-white'
      }`}
  >
    {testCase.name}
  </button>
);

const CodingProblemPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('description');
  const [activeTestCase, setActiveTestCase] = useState(1);
  const [selectedLanguage, setSelectedLanguage] = useState(71); // Python3
  const [code, setCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState(50);
  const [editorHeight, setEditorHeight] = useState(50);
  const [isResizing, setIsResizing] = useState<'horizontal' | 'vertical' | null>(null);

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const handleBack = () => {
    router.back();
  }


  // Judge0 language mappings
  const languages: Language[] = [
    {
      id: 71,
      name: 'python3',
      label: 'Python 3',
      monacoLanguage: 'python',
      defaultCode: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Your code here
        pass`
    },
    {
      id: 63,
      name: 'javascript',
      label: 'JavaScript',
      monacoLanguage: 'javascript',
      defaultCode: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Your code here
};`
    },
    {
      id: 62,
      name: 'java',
      label: 'Java',
      monacoLanguage: 'java',
      defaultCode: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
        return new int[]{};
    }
}`
    },
    {
      id: 54,
      name: 'cpp',
      label: 'C++',
      monacoLanguage: 'cpp',
      defaultCode: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Your code here
        return {};
    }
};`
    }
  ];

  // Mock data
  const problemData: ProblemData = {
    id: 1,
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]"
      }
    ],
    constraints: [
      "2 <= nums.length <= 104",
      "-109 <= nums[i] <= 109",
      "-109 <= target <= 109",
      "Only one valid answer exists."
    ],
    followUp: "Follow-up: Can you come up with an algorithm that is less than O(n2) time complexity?",
    timeRemaining: "02:00:00",
    testCases: [
      { id: 1, name: "case 1", input: "[2,7,11,15]\n9", output: "[0,1]" },
      { id: 2, name: "case 2", input: "[3,2,4]\n6", output: "[1,2]" },
      { id: 3, name: "case 3", input: "[3,3]\n6", output: "[0,1]" }
    ]
  };

  // Effect to reinitialize editor when language changes
  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      const newLanguage = languages.find(lang => lang.id === selectedLanguage);
      if (newLanguage && editorRef.current.getModel()?.getLanguageId() !== newLanguage.monacoLanguage) {
        handleLanguageChange(selectedLanguage);
      }
    }
  }, [selectedLanguage]);

  const currentLanguage = languages.find(lang => lang.id === selectedLanguage)!;
  const activeTestCaseData = problemData.testCases.find(tc => tc.id === activeTestCase);

  // Initialize Monaco Editor
  useEffect(() => {
    // Check if Monaco is already loaded
    if (window.monaco) {
      monacoRef.current = window.monaco;
      initializeEditor();
      return;
    }

    // Set up Monaco environment
    window.MonacoEnvironment = {
      getWorkerUrl: function (moduleId: string, label: string) {
        if (label === 'json') {
          return 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/language/json/json.worker.min.js';
        }
        if (label === 'css' || label === 'scss' || label === 'less') {
          return 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/language/css/css.worker.min.js';
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
          return 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/language/html/html.worker.min.js';
        }
        if (label === 'typescript' || label === 'javascript') {
          return 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/language/typescript/ts.worker.min.js';
        }
        return 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/editor/editor.worker.min.js';
      }
    };

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/loader.min.js';
    script.onload = () => {
      if (window.require) {
        window.require.config({
          paths: {
            vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs'
          }
        });

        window.require(['vs/editor/editor.main'], () => {
          monacoRef.current = window.monaco;
          initializeEditor();
        });
      }
    };

    script.onerror = () => {
      console.error('Failed to load Monaco Editor');
    };

    document.head.appendChild(script);

    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
      }
      // Remove script tag on cleanup
      const scripts = document.querySelectorAll('script[src*="monaco-editor"]');
      scripts.forEach(s => s.remove());
    };
  }, []);

  const initializeEditor = () => {
    if (monacoRef.current && document.getElementById('monaco-editor')) {
      // Dispose existing editor if it exists
      if (editorRef.current) {
        editorRef.current.dispose();
      }

      try {
        editorRef.current = monacoRef.current.editor.create(
          document.getElementById('monaco-editor'),
          {
            value: currentLanguage.defaultCode,
            language: currentLanguage.monacoLanguage,
            theme: 'vs',
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
            automaticLayout: true,
            minimap: { enabled: false },
            wordWrap: 'on',
            contextmenu: true,
            mouseWheelZoom: true,
            folding: true,
            lineDecorationsWidth: 20,
            lineNumbersMinChars: 3,
            glyphMargin: false,
          }
        );

        editorRef.current.onDidChangeModelContent(() => {
          if (editorRef.current) {
            setCode(editorRef.current.getValue());
          }
        });

        setCode(currentLanguage.defaultCode);
      } catch (error) {
        console.error('Error initializing Monaco Editor:', error);
      }
    }
  };

  const handleLanguageChange = (languageId: number) => {
    const newLanguage = languages.find(lang => lang.id === languageId)!;
    setSelectedLanguage(languageId);

    if (editorRef.current && monacoRef.current) {
      try {
        // Create new model with the new language
        const model = monacoRef.current.editor.createModel(
          newLanguage.defaultCode,
          newLanguage.monacoLanguage
        );

        // Dispose old model
        const oldModel = editorRef.current.getModel();
        if (oldModel) {
          oldModel.dispose();
        }

        editorRef.current.setModel(model);
        setCode(newLanguage.defaultCode);
      } catch (error) {
        console.error('Error changing language:', error);
        // Fallback: reinitialize editor
        initializeEditor();
      }
    }
  };

  // Judge0 API simulation
  const submitCode = async (isRun: boolean = false) => {
    setIsRunning(true);
    setSubmissionResult(null);

    try {
      // Mock API call to Judge0
      const submission = {
        source_code: code,
        language_id: selectedLanguage,
        stdin: activeTestCaseData?.input || "",
        expected_output: activeTestCaseData?.output || ""
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock response
      const mockResult: SubmissionResult = {
        status: "Accepted",
        output: activeTestCaseData?.output || "[0,1]",
        time: "0.012s",
        memory: "13.2 MB"
      };

      setSubmissionResult(mockResult);
    } catch (error) {
      setSubmissionResult({
        status: "Error",
        error: "Failed to execute code"
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Resizing handlers
  const handleMouseDown = (type: 'horizontal' | 'vertical') => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(type);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();

      if (isResizing === 'horizontal') {
        const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
        setLeftPanelWidth(Math.max(20, Math.min(80, newWidth)));
      } else if (isResizing === 'vertical') {
        const rightPanel = containerRef.current.querySelector('.right-panel') as HTMLElement;
        if (rightPanel) {
          const rightRect = rightPanel.getBoundingClientRect();
          const newHeight = ((e.clientY - rightRect.top) / rightRect.height) * 100;
          setEditorHeight(Math.max(20, Math.min(80, newHeight)));
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(null);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div className="min-h-screen bg-gray-50" ref={containerRef}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg"
              onClick={handleBack}
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              {problemData.id}. {problemData.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => submitCode(true)}
              disabled={isRunning}
              className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
            >
              <Play className="h-4 w-4" />
              {isRunning ? 'Running...' : 'Run'}
            </button>
            <button
              onClick={() => submitCode(false)}
              disabled={isRunning}
              className="bg-gray-800 hover:bg-gray-900 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
            >
              <Upload className="h-4 w-4" />
              Submit
            </button>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">{problemData.timeRemaining}</div>
              <div className="text-xs text-gray-600">Time remaining</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Left Panel - Problem Description */}
        <div
          className="bg-white border-r border-gray-200"
          style={{ width: `${leftPanelWidth}%` }}
        >
          {/* Tabs */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex gap-2">
              <Tab
                label="Description"
                active={activeTab === 'description'}
                onClick={() => setActiveTab('description')}
              />
              <Tab
                label="Submissions"
                active={activeTab === 'submissions'}
                onClick={() => setActiveTab('submissions')}
              />
              <div className="flex items-center gap-2 ml-auto">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  Solved
                </div>
                <button className="p-1 hover:bg-gray-200 rounded">
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Problem Content */}
          <div className="p-6 overflow-y-auto" style={{ height: 'calc(100vh - 140px)' }}>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed mb-6 whitespace-pre-line">
                {problemData.description}
              </p>

              {problemData.examples.map((example, index) => (
                <div key={index} className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Example {index + 1}:</h4>
                  <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm">
                    <div className="mb-1">
                      <strong>Input:</strong> {example.input}
                    </div>
                    <div className="mb-1">
                      <strong>Output:</strong> {example.output}
                    </div>
                    {example.explanation && (
                      <div>
                        <strong>Explanation:</strong> {example.explanation}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Constraints:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {problemData.constraints.map((constraint, index) => (
                    <li key={index} className="font-mono text-sm">{constraint}</li>
                  ))}
                </ul>
              </div>

              {problemData.followUp && (
                <div className="mb-6">
                  <p className="text-gray-700">
                    <strong>•</strong> {problemData.followUp}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Horizontal Resizer */}
        <div
          className="w-1 bg-gray-300 hover:bg-gray-400 cursor-col-resize flex items-center justify-center"
          onMouseDown={handleMouseDown('horizontal')}
        >
          <GripVertical className="h-4 w-4 text-gray-500" />
        </div>

        {/* Right Panel - Code Editor and Test Cases */}
        <div
          className="flex flex-col right-panel"
          style={{ width: `${100 - leftPanelWidth - 0.1}%` }}
        >
          {/* Code Editor */}
          <div
            className="bg-gray-200"
            style={{ height: `${editorHeight}%` }}
          >
            {/* Code Header */}
            <div className="px-6 py-4 bg-gray-100 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Code</span>
                </div>
                <div className="flex items-center gap-3">
                  <button className="p-1 hover:bg-gray-200 rounded">
                    <Maximize2 className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleLanguageChange(selectedLanguage)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <RotateCcw className="h-4 w-4 text-gray-600" />
                  </button>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => handleLanguageChange(Number(e.target.value))}
                    className="text-sm bg-white border border-gray-300 rounded px-3 py-1"
                  >
                    {languages.map(lang => (
                      <option key={lang.id} value={lang.id}>{lang.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Monaco Editor Container */}
            <div className="p-6 bg-gray-200" style={{ height: 'calc(100% - 70px)' }}>
              <div
                id="monaco-editor"
                className="bg-white rounded-lg border border-gray-300"
                style={{ height: '100%', width: '100%' }}
              />
              {/* Fallback textarea if Monaco fails to load */}
              {!monacoRef.current && (
                <div className="absolute inset-6 bg-white rounded-lg">
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Loading Monaco Editor..."
                    className="w-full h-full p-4 font-mono text-sm border-0 resize-none outline-none bg-white rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Vertical Resizer */}
          <div
            className="h-1 bg-gray-300 hover:bg-gray-400 cursor-row-resize flex items-center justify-center"
            onMouseDown={handleMouseDown('vertical')}
          >
            <GripVertical className="h-4 w-4 text-gray-500 rotate-90" />
          </div>

          {/* Test Cases */}
          <div
            className="bg-gray-200"
            style={{ height: `${100 - editorHeight - 0.1}%` }}
          >
            {/* Test Cases Header */}
            <div className="px-6 py-4 bg-gray-100 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Testcases</h3>
                <div className="flex items-center gap-2">
                  <button className="p-1 hover:bg-gray-200 rounded">
                    <Maximize2 className="h-4 w-4 text-gray-600" />
                  </button>
                  <button className="p-1 hover:bg-gray-200 rounded">
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Test Case Tabs */}
            <div className="px-6 py-3 bg-gray-100 border-b border-gray-200">
              <div className="flex items-center gap-2">
                {problemData.testCases.map((testCase) => (
                  <TestCaseTab
                    key={testCase.id}
                    testCase={testCase}
                    active={activeTestCase === testCase.id}
                    onClick={() => setActiveTestCase(testCase.id)}
                  />
                ))}
                <button className="p-2 hover:bg-gray-200 rounded-lg">
                  <Plus className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Test Case Content */}
            <div className="p-6 bg-gray-200 overflow-y-auto" style={{ height: 'calc(100% - 140px)' }}>
              {activeTestCaseData && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Input:</h4>
                    <div className="bg-white rounded-lg p-3 font-mono text-sm text-gray-800 whitespace-pre-wrap">
                      {activeTestCaseData.input}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Expected Output:</h4>
                    <div className="bg-white rounded-lg p-3 font-mono text-sm text-gray-800">
                      {activeTestCaseData.output}
                    </div>
                  </div>

                  {submissionResult && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Result:</h4>
                      <div className={`rounded-lg p-3 font-mono text-sm ${submissionResult.status === 'Accepted'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                        <div className="mb-2">
                          <strong>Status:</strong> {submissionResult.status}
                        </div>
                        {submissionResult.output && (
                          <div className="mb-2">
                            <strong>Output:</strong> {submissionResult.output}
                          </div>
                        )}
                        {submissionResult.time && (
                          <div className="mb-2">
                            <strong>Time:</strong> {submissionResult.time}
                          </div>
                        )}
                        {submissionResult.memory && (
                          <div className="mb-2">
                            <strong>Memory:</strong> {submissionResult.memory}
                          </div>
                        )}
                        {submissionResult.error && (
                          <div className="text-red-600">
                            <strong>Error:</strong> {submissionResult.error}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingProblemPage;