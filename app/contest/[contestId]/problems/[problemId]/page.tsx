"use client";
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Play, Upload, TriangleAlert, GripVertical, Plus, X, CheckCircle, XCircle, AlertCircle, Clock, Eye, EyeOff, Trash2, Code, List } from 'lucide-react';
import { useParams } from 'next/navigation';

// --- Types ---
interface Language {
    id: string;
    boilerplate: string;
    language: {
        id: string;
        name: string;
        judge0Code: number;
    };
}
interface TestCase {
    id: string;
    input: string;
    output: string;
    explanation?: string;
    isSample: boolean;
    weight?: number;
}
interface CustomTestCase {
    id: string;
    input: string;
    output: string;
    isCustom: true;
}
interface ProblemTag {
    id: string;
    name: string;
}
interface ProblemDetail {
    id: string;
    title: string;
    problemStatement: string;
    constraints: string;
    problemTags: ProblemTag[];
    problemLanguage: Language[];
}
interface ProblemData {
    problemDetail: ProblemDetail;
    testcases: TestCase[];
}
interface RunResult {
    status: "Queued" | "Failed" | "Running" | "Done";
    result?: {
        runId: string;
        totalTestCases: number;
        passedTestCases: number; // ← should be number, not boolean
        results: Array<{
            status: string;
            output: string;
            expectedOutput?: string; // ← Add this
            executionTime?: number;
            memory?: number;
            passed?: boolean;
            compilerError?: string;
            runtimeError?: string;
        }>;
    };
}
interface SubmissionHistoryItem {
    id: string;
    status: "Accepted" | "Partially Accepted" | "Rejected";
    language: { id: string; name: string };
    executionTime: number | null;
    submittedAt: string;
    code: string;
}

// --- Custom Hook: Polling ---
const usePolling = <T,>(url: string | null, interval = 500) => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const pollUrlRef = useRef<string | null>(null);
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        // Only start polling if URL is provided and different from previous
        if (!url || url === pollUrlRef.current) return;

        // Cancel any existing poll
        if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
        }

        pollUrlRef.current = url;
        let cancelled = false;

        const poll = async () => {
            if (cancelled) return;
            setLoading(true);
            try {
                const res = await fetch(url, {
                    method: 'GET',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                });
                const result = await res.json();
                const runData = result.data;

                setData(runData);

                // Stop if done or failed
                if (runData.status === "Done" || runData.status === "Failed") {
                    pollUrlRef.current = null; // Allow future polls
                    return;
                }

                if (!cancelled) {
                    const dynamicInterval = data === null ? 300 : interval;
                    timeoutRef.current = window.setTimeout(poll, dynamicInterval);
                }
            } catch (err) {
                if (!cancelled) {
                    setError("Failed to fetch result");
                    setLoading(false);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        // Start first poll
        poll();

        return () => {
            cancelled = true;
            if (timeoutRef.current) {
                window.clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [url, interval]); // Only react to URL or interval change

    return { data, loading, error };
};

// --- Main Component ---
const CodingProblemPage = () => {
    const [activeTab, setActiveTab] = useState<'description' | 'submissions'>('description');
    const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
    const [code, setCode] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [runResult, setRunResult] = useState<RunResult | null>(null);
    const [leftPanelWidth, setLeftPanelWidth] = useState(45);
    const [editorHeight, setEditorHeight] = useState(55);
    const [isResizing, setIsResizing] = useState<'horizontal' | 'vertical' | null>(null);
    const [submissionHistory, setSubmissionHistory] = useState<SubmissionHistoryItem[]>([]);
    const [submissionsLoading, setSubmissionsLoading] = useState(false);
    const [customTestCases, setCustomTestCases] = useState<CustomTestCase[]>([]);
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [outputValue, setOutputValue] = useState('');
    const [testCaseView, setTestCaseView] = useState<'testcases' | 'result'>('testcases');
    const [showSampleOnly, setShowSampleOnly] = useState(false);

    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const runIdRef = useRef<string | null>(null);
    const submissionIdRef = useRef<string | null>(null);

    // State to trigger polling (this causes re-render)
    const [pollRunId, setPollRunId] = useState<string | null>(null);
    const [pollSubmissionId, setPollSubmissionId] = useState<string | null>(null);

    // Get problemId and contestId from URL
    const params = useParams();
    const problemId = params.problemId as string;
    const contestId = params.contestId as string;

    const [problemData, setProblemData] = useState<ProblemData | null>(null);
    const [loadingProblem, setLoadingProblem] = useState(true);

    // --- Fetch Problem Data ---
    useEffect(() => {
        const fetchProblemData = async () => {
            if (!problemId) return;
            setLoadingProblem(true);
            try {
                const url = contestId
                    ? `http://localhost:4000/api/v1/contests/problem/detail/${problemId}?contestId=${contestId}`
                    : `http://localhost:4000/api/v1/problems/detail/${problemId}`;
                const res = await fetch(url, { credentials: 'include' });
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                const data = await res.json();
                setProblemData(data.data);
            } catch (error) {
                console.error("Error fetching problem:", error);
                alert("Failed to load problem. Please try again.");
            } finally {
                setLoadingProblem(false);
            }
        };
        fetchProblemData();
    }, [problemId, contestId]);

    // Initialize selected language and code
    useEffect(() => {
        if (problemData && problemData.problemDetail.problemLanguage.length > 0) {
            const defaultLang = problemData.problemDetail.problemLanguage[0];
            setSelectedLanguage(defaultLang);
            setCode(defaultLang.boilerplate);
        }
    }, [problemData]);

    // --- Polling for Run Result ---
    const { data: polledRunResult } = usePolling<RunResult>(
        pollRunId ? `http://localhost:4000/api/v1/run/${pollRunId}` : null
    );

    // --- Polling for Submission Result ---
    const { data: polledSubmissionResult } = usePolling<RunResult>(
        pollSubmissionId ? `http://localhost:4000/api/v1/submissions/active/${pollSubmissionId}` : null
    );

    // --- Update Run Result from Polling ---
    useEffect(() => {
        if (polledRunResult) {

            setRunResult({
                status: polledRunResult.status,
                result: polledRunResult.result // Keep full structure
            });

            setTestCaseView('result');
            if (polledRunResult.status === "Done" || polledRunResult.status === "Failed") {
                setIsRunning(false);
                setPollRunId(null); // Stop polling
            }
        }
    }, [polledRunResult]);

    // --- Update Submission Result ---
    useEffect(() => {
        if (polledSubmissionResult && submissionIdRef.current) {
            if (polledSubmissionResult.status === "Done" || polledSubmissionResult.status === "Failed") {
                setIsSubmitting(false);
                submissionIdRef.current = null;
                fetchSubmissionHistory();
            }
        }
    }, [polledSubmissionResult]);

    // --- Fetch Submission History ---
    const fetchSubmissionHistory = async () => {
        if (!problemId) return;
        setSubmissionsLoading(true);
        try {
            const res = await fetch(`http://localhost:4000/api/v1/submissions/history/${problemId}`, {
                credentials: 'include',
            });
            const data = await res.json();
            setSubmissionHistory(data.data.submissions);
        } catch (error) {
            console.error("Failed to load submission history:", error);
        } finally {
            setSubmissionsLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'submissions') {
            fetchSubmissionHistory();
        }
    }, [activeTab, problemId]);

    // --- Initialize Monaco Editor ---
    useEffect(() => {
        if (!selectedLanguage) return;
        if (window.monaco) {
            initializeEditor();
            return;
        }
        window.MonacoEnvironment = {
            getWorkerUrl: (_moduleId: string, label: string) => {
                const baseUrl = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min';
                if (label === 'json') return `${baseUrl}/vs/language/json/json.worker.min.js`;
                if (['css', 'scss', 'less'].includes(label)) return `${baseUrl}/vs/language/css/css.worker.min.js`;
                if (['html', 'handlebars', 'razor'].includes(label)) return `${baseUrl}/vs/language/html/html.worker.min.js`;
                if (['typescript', 'javascript'].includes(label)) return `${baseUrl}/vs/language/typescript/ts.worker.min.js`;
                return `${baseUrl}/vs/editor/editor.worker.min.js`;
            },
        };
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/loader.min.js';
        script.onload = () => {
            window.require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });
            window.require(['vs/editor/editor.main'], () => {
                monacoRef.current = window.monaco;
                initializeEditor();
            });
        };
        document.head.appendChild(script);

        return () => {
            if (editorRef.current) editorRef.current.dispose();
        };
    }, [selectedLanguage]);

    const initializeEditor = () => {
        if (editorRef.current) editorRef.current.dispose();
        const langMap: Record<string, string> = {
            'Python': 'python',
            'C++': 'cpp',
            'Java': 'java',
            'JavaScript': 'javascript',
        };
        const monacoLang = langMap[selectedLanguage?.language.name || 'Python'] || 'plaintext';
        const model = monacoRef.current.editor.createModel(code, monacoLang);
        editorRef.current = monacoRef.current.editor.create(
            document.getElementById('monaco-editor')!,
            {
                model,
                theme: 'vs-dark',
                fontSize: 14,
                lineNumbers: 'on',
                automaticLayout: true,
                minimap: { enabled: false },
                wordWrap: 'on',
                mouseWheelZoom: true,
                folding: true,
                padding: { top: 15, bottom: 15 },
                scrollBeyondLastLine: false,
                renderWhitespace: 'selection',
                contextmenu: true,
                quickSuggestions: true,
                suggestOnTriggerCharacters: true,
            }
        );
        editorRef.current.onDidChangeModelContent(() => {
            setCode(editorRef.current.getValue());
        });
    };

    // --- Handle Language Change ---
    const handleLanguageChange = (langId: string) => {
        const lang = problemData?.problemDetail.problemLanguage.find(l => l.id === langId);
        if (lang) {
            setSelectedLanguage(lang);
            setCode(lang.boilerplate);
        }
    };

    // --- Get All Test Cases (Sample + Custom) ---
    const getAllTestCases = () => {
        const testcases = problemData?.testcases.map(tc => ({
            input: tc.input.trim(),
            output: tc.output.trim(),
        })) || [];
        const customTCs = customTestCases.map(tc => ({
            input: tc.input.trim(),
            output: tc.output.trim(),
        }));
        return [...testcases, ...customTCs];
    };

    // --- Run Code ---
    const runCode = async () => {
        if (!problemData || !selectedLanguage || !code.trim()) {
            alert("Please write some code first.");
            return;
        }
        const allTestCases = getAllTestCases();
        if (allTestCases.length === 0) {
            alert("No test cases available to run.");
            return;
        }

        setIsRunning(true);
        setRunResult(null);
        setPollRunId(null); // Reset polling state

        try {
            const res = await fetch('http://localhost:4000/api/v1/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    problemId: problemData.problemDetail.id,
                    testCases: allTestCases,
                    code,
                    languageId: selectedLanguage.language.id,
                    languageCode: JSON.stringify(selectedLanguage.language.judge0Code),
                }),
            });
            const data = await res.json();
            runIdRef.current = data.data.runId;
            setPollRunId(data.data.runId); // ✅ Trigger polling via state
        } catch (error) {
            console.error("Run request failed:", error);
            alert("Failed to run code. Please try again.");
            setIsRunning(false);
        }
    };

    // --- Submit Code ---
    const submitCode = async () => {
        if (!problemData || !selectedLanguage || !code.trim()) {
            alert("Please write some code first.");
            return;
        }
        setIsSubmitting(true);
        setPollSubmissionId(null); // Reset polling
        try {
            const res = await fetch('http://localhost:4000/api/v1/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    problemId: problemData.problemDetail.id,
                    languageId: selectedLanguage.language.id,
                    code,
                    submissionTime: new Date().toISOString(),
                    languageCode: JSON.stringify(selectedLanguage.language.judge0Code),
                    contestId,
                }),
            });
            const data = await res.json();
            setPollSubmissionId(data.data.submissionId); // ✅ Trigger polling
        } catch (error) {
            console.error("Submission failed:", error);
            alert("Failed to submit code. Please try again.");
            setIsSubmitting(false);
        }
    };

    // --- Add Custom Test Case ---
    const addCustomTestCase = () => {
        if (!inputValue.trim() || !outputValue.trim()) {
            alert("Both input and expected output are required.");
            return;
        }
        const newTestCase: CustomTestCase = {
            id: `custom-${Date.now()}`,
            input: inputValue,
            output: outputValue,
            isCustom: true,
        };
        setCustomTestCases(prev => [...prev, newTestCase]);
        setInputValue('');
        setOutputValue('');
        setShowCustomInput(false);
    };

    // --- Remove Custom Test Case ---
    const removeCustomTestCase = (id: string) => {
        setCustomTestCases(prev => prev.filter(tc => tc.id !== id));
    };

    // --- Mouse Down Handler (for resizing) ---
    const handleMouseDown = (type: 'horizontal' | 'vertical') => (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(type);
    };

    // --- Mouse Move Effect ---
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing || !containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            if (isResizing === 'horizontal') {
                const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
                setLeftPanelWidth(Math.max(25, Math.min(75, newWidth)));
            } else if (isResizing === 'vertical') {
                const rightPanel = containerRef.current.querySelector('.right-panel') as HTMLElement;
                if (rightPanel) {
                    const rightRect = rightPanel.getBoundingClientRect();
                    const newHeight = ((e.clientY - rightRect.top) / rightRect.height) * 100;
                    setEditorHeight(Math.max(30, Math.min(80, newHeight)));
                }
            }
        };
        const handleMouseUp = () => setIsResizing(null);

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    // --- Get visible test cases ---
    const getVisibleTestCases = () => {
        if (!problemData || !problemData.testcases) return [];
        return showSampleOnly
            ? problemData.testcases.filter(tc => tc.isSample)
            : problemData.testcases;
    };

    if (loadingProblem) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <span className="ml-3">Loading problem...</span>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen bg-gray-900 text-gray-100 flex flex-col" ref={containerRef}>
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex-shrink-0 shadow-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                            <ArrowLeft className="h-5 w-5 text-gray-300" />
                        </button>
                        <h1 className="text-xl font-bold text-white">{problemData?.problemDetail.title}</h1>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-900 text-green-200">
                            Easy
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={selectedLanguage?.id || ''}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {problemData?.problemDetail.problemLanguage.map(lang => (
                                <option key={lang.id} value={lang.id}>
                                    {lang.language.name}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={runCode}
                            disabled={isRunning}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
                        >
                            <Play className="h-4 w-4" />
                            {isRunning ? 'Running...' : 'Run'}
                        </button>
                        <button
                            onClick={submitCode}
                            disabled={isSubmitting}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
                        >
                            <Upload className="h-4 w-4" />
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Panel */}
                <div className="bg-gray-800 border-r border-gray-700 flex flex-col" style={{ width: `${leftPanelWidth}%` }}>
                    <div className="px-6 py-4 border-b border-gray-700 bg-gray-750 flex-shrink-0">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveTab('description')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'description'
                                    ? 'bg-gray-700 text-blue-400 shadow-sm'
                                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                                    }`}
                            >
                                Description
                            </button>
                            <button
                                onClick={() => setActiveTab('submissions')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'submissions'
                                    ? 'bg-gray-700 text-blue-400 shadow-sm'
                                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                                    }`}
                            >
                                Submissions
                            </button>
                        </div>
                    </div>

                    {activeTab === 'description' && (
                        <div className="flex-1 p-6 overflow-y-auto">
                            <div className="prose prose-invert max-w-none">
                                <div className="text-gray-300 leading-relaxed mb-6 whitespace-pre-line">
                                    {problemData?.problemDetail.problemStatement}
                                </div>
                                <h4 className="font-semibold text-gray-100 mb-2">Constraints</h4>
                                <pre className="text-gray-300 mb-6 text-sm bg-gray-700 p-4 rounded-lg border border-gray-600">
                                    {problemData?.problemDetail.constraints}
                                </pre>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {problemData?.problemDetail.problemTags.map(tag => (
                                        <span key={tag.id} className="px-3 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300 border border-gray-600">
                                            {tag.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'submissions' && (
                        <div className="flex-1 p-6 overflow-y-auto">
                            <h3 className="text-lg font-semibold text-white mb-4">Submission History</h3>
                            {submissionsLoading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin h-6 w-6 border-b-2 border-blue-500 rounded-full"></div>
                                </div>
                            ) : submissionHistory.length === 0 ? (
                                <p className="text-gray-400">No submissions yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {submissionHistory.map((submission, i) => (
                                        <div key={i} className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                                            <div className="flex justify-between items-start mb-2">
                                                <StatusBadge status={submission.status} />
                                                <span className="text-xs text-gray-400">
                                                    {new Date(submission.submittedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-300">{submission.language.name}</span>
                                                {submission.executionTime && (
                                                    <span className="text-gray-400 flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {submission.executionTime}ms
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Vertical Resizer */}
                <div
                    className="w-1 bg-gray-600 hover:bg-gray-500 cursor-col-resize flex items-center justify-center transition-colors"
                    onMouseDown={handleMouseDown('horizontal')}
                >
                    <GripVertical className="h-4 w-4 text-gray-500" />
                </div>

                {/* Right Panel */}
                <div className="flex flex-col right-panel" style={{ width: `${100 - leftPanelWidth}%` }}>
                    {/* Editor */}
                    <div className="bg-gray-800 flex flex-col" style={{ height: `${editorHeight}%` }}>
                        <div className="px-4 py-2 bg-gray-750 border-b border-gray-600 flex items-center justify-between flex-shrink-0">
                            <span className="text-sm font-medium text-gray-300">Code Editor</span>
                            <span className="text-xs text-gray-400">{selectedLanguage?.language.name}</span>
                        </div>
                        <div className="flex-1 p-4">
                            <div id="monaco-editor" className="h-full w-full rounded-lg border border-gray-600" />
                        </div>
                    </div>

                    {/* Horizontal Resizer */}
                    <div
                        className="h-1 bg-gray-600 hover:bg-gray-500 cursor-row-resize transition-colors"
                        onMouseDown={handleMouseDown('vertical')}
                    >
                        <GripVertical className="h-4 w-4 text-gray-500 rotate-90 mx-auto" />
                    </div>

                    {/* Test Cases & Results */}
                    <div className="bg-gray-800 flex flex-col" style={{ height: `${100 - editorHeight}%` }}>
                        <div className="px-6 py-4 bg-gray-750 border-b border-gray-600 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setTestCaseView('testcases')}
                                        className={`px-3 py-1 text-sm font-medium rounded transition-colors ${testCaseView === 'testcases'
                                            ? 'bg-gray-600 text-white'
                                            : 'text-gray-400 hover:text-gray-200'
                                            }`}
                                    >
                                        <List className="h-4 w-4 inline mr-1" />
                                        Testcases
                                    </button>
                                    <button
                                        onClick={() => setTestCaseView('result')}
                                        className={`px-3 py-1 text-sm font-medium rounded transition-colors ${testCaseView === 'result'
                                            ? 'bg-gray-600 text-white'
                                            : 'text-gray-400 hover:text-gray-200'
                                            }`}
                                    >
                                        <Code className="h-4 w-4 inline mr-1" />
                                        Result
                                    </button>
                                </div>
                                {testCaseView === 'testcases' && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setShowSampleOnly(!showSampleOnly)}
                                            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm font-medium"
                                        >
                                            {showSampleOnly ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                            {showSampleOnly ? 'Show All' : 'Sample Only'}
                                        </button>
                                    </div>
                                )}
                            </div>
                            {testCaseView === 'testcases' && (
                                <button
                                    onClick={() => setShowCustomInput(!showCustomInput)}
                                    className="flex items-center gap-1 text-green-400 hover:text-green-300 text-sm font-medium"
                                >
                                    <Plus className="h-4 w-4" />
                                    {showCustomInput ? 'Cancel' : 'Add Test'}
                                </button>
                            )}
                        </div>

                        {showCustomInput && (
                            <div className="px-6 py-4 bg-gray-700 border-b border-gray-600 space-y-3 flex-shrink-0">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Input</label>
                                    <textarea
                                        placeholder="Enter test input..."
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        className="w-full p-3 border border-gray-600 rounded-lg bg-gray-800 text-gray-100 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Expected Output</label>
                                    <textarea
                                        placeholder="Enter expected output..."
                                        value={outputValue}
                                        onChange={(e) => setOutputValue(e.target.value)}
                                        className="w-full p-3 border border-gray-600 rounded-lg bg-gray-800 text-gray-100 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => setShowCustomInput(false)}
                                        className="px-3 py-2 border border-gray-600 rounded-lg text-sm hover:bg-gray-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={addCustomTestCase}
                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                                    >
                                        Add Test
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex-1 p-6 overflow-y-auto">
                            {testCaseView === 'testcases' ? (
                                <div className="space-y-4">
                                    {/* Sample Test Cases */}
                                    {getVisibleTestCases().map((testCase, idx) => (
                                        <div key={testCase.id} className="bg-gray-700 rounded-lg border border-gray-600">
                                            <div className="px-4 py-3 border-b border-gray-600 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-gray-200">
                                                        Test Case {idx + 1}
                                                    </span>
                                                    {testCase.isSample && (
                                                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-900 text-blue-200">
                                                            Sample
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="p-4 space-y-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-1">Input</label>
                                                    <pre className="bg-gray-800 p-3 rounded border border-gray-600 text-sm font-mono text-gray-100 overflow-x-auto">
                                                        {testCase.input}
                                                    </pre>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-1">Expected Output</label>
                                                    <pre className="bg-gray-800 p-3 rounded border border-gray-600 text-sm font-mono text-gray-100 overflow-x-auto">
                                                        {testCase.output}
                                                    </pre>
                                                </div>
                                                {testCase.explanation && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-300 mb-1">Explanation</label>
                                                        <p className="text-sm text-gray-400 p-3 bg-gray-800 rounded border border-gray-600">
                                                            {testCase.explanation}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Custom Test Cases */}
                                    {customTestCases.map((testCase, idx) => (
                                        <div key={testCase.id} className="bg-gray-700 rounded-lg border border-gray-600">
                                            <div className="px-4 py-3 border-b border-gray-600 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-gray-200">
                                                        Custom Test {idx + 1}
                                                    </span>
                                                    <span className="px-2 py-1 rounded text-xs font-medium bg-purple-900 text-purple-200">
                                                        Custom
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => removeCustomTestCase(testCase.id)}
                                                    className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-gray-600 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <div className="p-4 space-y-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-1">Input</label>
                                                    <pre className="bg-gray-800 p-3 rounded border border-gray-600 text-sm font-mono text-gray-100 overflow-x-auto">
                                                        {testCase.input}
                                                    </pre>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-1">Expected Output</label>
                                                    <pre className="bg-gray-800 p-3 rounded border border-gray-600 text-sm font-mono text-gray-100 overflow-x-auto">
                                                        {testCase.output}
                                                    </pre>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {getVisibleTestCases().length === 0 && customTestCases.length === 0 && (
                                        <div className="text-center text-gray-500 py-8">
                                            <List className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                            <p>No test cases available</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // Results View
                                <div className="space-y-4">
                                    {runResult?.result ? (
                                        <>
                                            {/* Summary Bar */}
                                            <div className="flex items-center justify-between mb-4 p-3 bg-gray-700 rounded-lg border border-gray-600">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg font-semibold text-gray-200">Test Results</span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                    ${runResult.status === 'Done' ? 'bg-green-900 text-green-200' :
                                                            runResult.status === 'Failed' ? 'bg-red-900 text-red-200' :
                                                                'bg-yellow-900 text-yellow-200'}`}>
                                                        {runResult.status}
                                                    </span>
                                                    <span className="text-sm text-gray-300">
                                                        {runResult.result.passedTestCases} / {runResult.result.totalTestCases} passed
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Individual Test Case Results */}
                                            <div className="space-y-4">
                                                {runResult.result.results.map((res, idx) => {
                                                    const isCustom = idx >= (problemData?.testcases.length || 0);
                                                    const label = isCustom
                                                        ? `Custom Test ${idx - (problemData?.testcases.length || 0) + 1}`
                                                        : `Test Case ${idx + 1}`;

                                                    let Icon, color, bg;

                                                    if (res.compilerError) {
                                                        Icon = XCircle;
                                                        color = 'text-red-400';
                                                        bg = 'bg-red-900/20 border-red-700';
                                                    } else if (res.runtimeError) {
                                                        Icon = TriangleAlert;
                                                        color = 'text-yellow-400';
                                                        bg = 'bg-yellow-900/20 border-yellow-700';
                                                    } else if (res.status === 'Accepted') {
                                                        Icon = CheckCircle;
                                                        color = 'text-green-400';
                                                        bg = 'bg-green-900/20 border-green-700';
                                                    } else {
                                                        Icon = XCircle;
                                                        color = 'text-red-400';
                                                        bg = 'bg-red-900/20 border-red-700';
                                                    }

                                                    return (
                                                        <div key={idx} className={`p-4 rounded-lg border ${bg} shadow-sm`}>
                                                            {/* Header: Status + Label */}
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <Icon className={`h-5 w-5 ${color}`} />
                                                                <strong className={`font-medium ${color}`}>
                                                                    {res.compilerError ? 'Compile Error' :
                                                                        res.runtimeError ? 'Runtime Error' :
                                                                            res.status}
                                                                </strong>
                                                                <span className="text-gray-400 text-sm">({label})</span>
                                                            </div>

                                                            {/* Compile Error */}
                                                            {res.compilerError && (
                                                                <div className="mb-3">
                                                                    <label className="block text-sm font-medium text-red-300 mb-1">Compile Error</label>
                                                                    <pre className="text-red-100 bg-red-900/40 p-3 rounded border border-red-700 text-sm font-mono overflow-x-auto">
                                                                        {res.compilerError}
                                                                    </pre>
                                                                </div>
                                                            )}

                                                            {/* Runtime Error */}
                                                            {res.runtimeError && !res.compilerError && (
                                                                <div className="mb-3">
                                                                    <label className="block text-sm font-medium text-yellow-300 mb-1">Runtime Error</label>
                                                                    <pre className="text-yellow-100 bg-yellow-900/40 p-3 rounded border border-yellow-700 text-sm font-mono overflow-x-auto">
                                                                        {res.runtimeError}
                                                                    </pre>
                                                                </div>
                                                            )}

                                                            {/* Output vs Expected (only if no compile/runtime error) */}
                                                            {!res.compilerError && !res.runtimeError && (
                                                                <>
                                                                    <div className="mb-2">
                                                                        <label className="block text-sm font-medium text-gray-300 mb-1">Output</label>
                                                                        <pre className="bg-gray-800 p-3 rounded border border-gray-600 text-sm font-mono text-gray-100 overflow-x-auto max-h-32 overflow-y-auto">
                                                                            {res.output || '<blank>'}
                                                                        </pre>
                                                                    </div>

                                                                    <div className="mb-2">
                                                                        <label className="block text-sm font-medium text-gray-300 mb-1">Expected</label>
                                                                        <pre className="bg-gray-800 p-3 rounded border border-green-600 text-sm font-mono text-green-200 overflow-x-auto max-h-32 overflow-y-auto">
                                                                            {problemData?.testcases[idx]?.output ??
                                                                                customTestCases[idx - (problemData?.testcases.length || 0)]?.output ??
                                                                                '<not available>'}
                                                                        </pre>
                                                                    </div>
                                                                </>
                                                            )}

                                                            {/* Metrics */}
                                                            <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                                                                {res.executionTime !== undefined && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Clock className="h-3 w-3" />
                                                                        {res.executionTime}ms
                                                                    </span>
                                                                )}
                                                                {res.memory !== undefined && (
                                                                    <span>Memory: {res.memory}KB</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center text-gray-500 py-12">
                                            <Play className="h-16 w-16 mx-auto mb-4 opacity-30" />
                                            <p className="text-lg mb-2">No results yet</p>
                                            <p className="text-sm">Run your code to see test results</p>
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

// --- Helper Component ---
const StatusBadge = ({ status }: { status: string }) => {
    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Accepted':
                return 'bg-green-900 text-green-200 border-green-700';
            case 'Partially Accepted':
                return 'bg-yellow-900 text-yellow-200 border-yellow-700';
            case 'Rejected':
                return 'bg-red-900 text-red-200 border-red-700';
            default:
                return 'bg-gray-700 text-gray-300 border-gray-600';
        }
    };
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusStyles(status)}`}>
            {status}
        </span>
    );
};

export default CodingProblemPage;