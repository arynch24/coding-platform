"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Play, Upload, Maximize2, RotateCcw, ChevronDown, Plus, GripVertical, Clock, X } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';

// Monaco Editor types and globals
declare global {
    interface Window {
        monaco: any;
        MonacoEnvironment: any;
        require: any;
    }
}

interface Language {
    id: string;                    // e.g., "cmelekm6e0003n56omucw75ff"
    boilerplate: string;
    language: {                    // nested object
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
}

interface ProblemDetail {
    id: string;
    title: string;
    problemStatement: string;
    constraints: string;
    problemLanguage: Language[];
}

interface ProblemData {
    problemDetail: ProblemDetail;
    sampleTestcases: TestCase[];
}

interface RunResult {
    status: "Queued" | "Failed" | "Running" | "Done";
    results?: Array<{
        status: string;
        output: string;
        error?: string;
        time?: number;
        compileError?: string;
        memory?: number;
    }>;
}

interface Submission {
    id: number;
    status: 'Accepted' | 'Rejected' | 'Pending';
    date: string;
    language: string;
    runtime: number;
}

// Custom hook for API polling
const usePolling = <T,>(url: string | null, interval = 1500) => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!url) return;

        let cancelled = false;
        const poll = async () => {
            setLoading(true);
            try {
                const res = await axios.get(url);
                const result = res.data.data;
                setData(result);

                if (result.status === "Done" || result.status === "Failed") {
                    return; // stop polling
                }

                if (!cancelled) {
                    setTimeout(poll, interval);
                }
            } catch (err: any) {
                setError(err.response?.data?.message || "Failed to fetch result");
                setLoading(false);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        poll();

        return () => {
            cancelled = true;
        };
    }, [url, interval]);

    return { data, loading, error };
};

const CodingProblemPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'description' | 'submissions'>('description');
    const [activeTestCase, setActiveTestCase] = useState<TestCase | null>(null);
    const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
    const [code, setCode] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [runResult, setRunResult] = useState<RunResult | null>(null);
    const [leftPanelWidth, setLeftPanelWidth] = useState(50);
    const [editorHeight, setEditorHeight] = useState(60);
    const [isResizing, setIsResizing] = useState<'horizontal' | 'vertical' | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [submissionsLoading, setSubmissionsLoading] = useState(false);

    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const runIdRef = useRef<string | null>(null);
    const submissionIdRef = useRef<string | null>(null);

    const router = useRouter();
    const params = useParams();
    const problemId = params?.problemId as string;

    // API: Fetch problem details
    const [problemData, setProblemData] = useState<ProblemData | null>(null);
    const [loadingProblem, setLoadingProblem] = useState(true);

    useEffect(() => {
        const fetchProblem = async () => {
            if (!problemId) return;
            try {
                const res = await axios.get(`http://localhost:4000/api/v1/problems/detail/${problemId}`, {
                    withCredentials: true,
                });
                const data: ProblemData = res.data.data;
                setProblemData(data);
                console.log(data);

                // Set default language (e.g., first one)
                const defaultLang = data.problemDetail.problemLanguage[0];
                setSelectedLanguage(defaultLang);
                setCode(defaultLang.boilerplate);

                // Set first sample test case
                if (data.sampleTestcases.length > 0) {
                    setActiveTestCase(data.sampleTestcases[0]);
                }

                setLoadingProblem(false);
            } catch (error) {
                console.error("Error fetching problem:", error);
                setLoadingProblem(false);
            }
        };

        fetchProblem();
    }, [problemId]);

    // Polling for Run Result
    const { data: polledRunResult } = usePolling<RunResult>(
        runIdRef.current ? `http://localhost:4000/api/v1/run/${runIdRef.current}` : null
    );

    // Polling for Submission Result
    const { data: polledSubmissionResult } = usePolling<RunResult>(
        submissionIdRef.current ? `http://localhost:4000/api/v1/submissions/active/${submissionIdRef.current}` : null
    );

    // Update run result when polled
    useEffect(() => {
        if (polledRunResult) setRunResult(polledRunResult);
    }, [polledRunResult]);

    // Update submission result and add to list
    useEffect(() => {
        if (polledSubmissionResult && submissionIdRef.current) {
            const latest = polledSubmissionResult.results?.[0];
            if (latest && (polledSubmissionResult.status === "Done" || polledSubmissionResult.status === "Failed")) {
                const newSubmission: Submission = {
                    id: submissions.length + 1,
                    status: latest.status === "Accepted" ? "Accepted" : "Rejected",
                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    language: selectedLanguage?.language.name || "Unknown",
                    runtime: latest.time || 0,
                };
                setSubmissions(prev => [newSubmission, ...prev]);
                submissionIdRef.current = null; // reset
            }
        }
    }, [polledSubmissionResult, selectedLanguage]);

    // Initialize Monaco Editor
    useEffect(() => {
        if (!selectedLanguage || !problemData) return;

        if (window.monaco) {
            initializeEditor();
            return;
        }

        window.MonacoEnvironment = {
            getWorkerUrl: function (_moduleId: string, label: string) {
                if (label === 'json') return 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/language/json/json.worker.min.js';
                if (['css', 'scss', 'less'].includes(label)) return 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/language/css/css.worker.min.js';
                if (['html', 'handlebars', 'razor'].includes(label)) return 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/language/html/html.worker.min.js';
                if (['typescript', 'javascript'].includes(label)) return 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/language/typescript/ts.worker.min.js';
                return 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/editor/editor.worker.min.js';
            }
        };

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/loader.min.js';
        script.onload = () => {
            window.require.config({
                paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' }
            });
            window.require(['vs/editor/editor.main'], () => {
                monacoRef.current = window.monaco;
                initializeEditor();
            });
        };
        document.head.appendChild(script);

        return () => {
            if (editorRef.current) editorRef.current.dispose();
        };
    }, [selectedLanguage, problemData]);

    const initializeEditor = () => {
        if (editorRef.current) editorRef.current.dispose();

        const langMap: Record<string, string> = {
            'Python': 'python',
            'C++': 'cpp',
            'Java': 'java',
            'JavaScript': 'javascript',
        };
        const monacoLang = langMap[selectedLanguage?.language.name || 'Python'] || 'plaintext';

        const model = monacoRef.current.editor.createModel(
            code,
            monacoLang
        );

        editorRef.current = monacoRef.current.editor.create(
            document.getElementById('monaco-editor')!,
            {
                model,
                theme: 'vs',
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                readOnly: false,
                automaticLayout: true,
                minimap: { enabled: false },
                wordWrap: 'on',
                mouseWheelZoom: true,
                folding: true,
            }
        );

        editorRef.current.onDidChangeModelContent(() => {
            setCode(editorRef.current.getValue());
        });
    };

    // Handle language change
    const handleLanguageChange = (langId: string) => {
        const lang = problemData?.problemDetail.problemLanguage.find(l => l.id === langId);
        if (lang) {
            setSelectedLanguage(lang);
            setCode(lang.boilerplate);
        }
    };

    // Run code (custom run)
    const runCode = async () => {
        if (!selectedLanguage || !activeTestCase || !problemData) return;

        setIsRunning(true);
        setRunResult(null);
        runIdRef.current = null;

        try {
            console.log("language code:", selectedLanguage.language.judge0Code);
            const res = await axios.post(
                'http://localhost:4000/api/v1/run',
                {
                    problemId: problemData.problemDetail.id,
                    testCases: [{
                        input: JSON.stringify(activeTestCase.input),
                        output: JSON.stringify(activeTestCase.output),
                    }],
                    code,
                    languageId: selectedLanguage.id,
                    languageCode: JSON.stringify(selectedLanguage.language.judge0Code),
                },
                { withCredentials: true }
            );

            runIdRef.current = res.data.data.runId;
        } catch (error: any) {
            setRunResult({
                status: "Failed",
                results: [{ status: "Error", output: "", error: error.response?.data?.message || "Run failed" }]
            });
        } finally {
            setIsRunning(false);
        }
    };

    // Submit code
    const submitCode = async () => {
        if (!selectedLanguage || !problemData) return;

        setIsRunning(true);
        submissionIdRef.current = null;

        try {
            const res = await axios.post(
                'http://localhost:4000/api/v1/submissions',
                {
                    problemId: problemData.problemDetail.id,
                    languageId: selectedLanguage.id,
                    code,
                    submissionTime: new Date().toISOString(),
                    languageCode: selectedLanguage.language.judge0Code,
                },
                { withCredentials: true }
            );

            submissionIdRef.current = res.data.data.submissionId;
        } catch (error: any) {
            alert("Submission failed: " + (error.response?.data?.message || "Unknown error"));
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

    if (loadingProblem) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading problem...</span>
            </div>
        );
    }

    if (!problemData) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <p className="text-red-600">Problem not found.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50" ref={containerRef}>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <h1 className="text-xl font-semibold text-gray-900">
                            {problemData.problemDetail.title}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <select
                            value={selectedLanguage?.id || ''}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        >
                            {problemData.problemDetail.problemLanguage.map(lang => (
                                <option key={lang.id} value={lang.id}>
                                    {lang.language.name}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={runCode}
                            disabled={isRunning}
                            className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
                        >
                            <Play className="h-4 w-4" />
                            {isRunning ? 'Running...' : 'Run'}
                        </button>
                        <button
                            onClick={submitCode}
                            disabled={isRunning}
                            className="bg-gray-800 hover:bg-gray-900 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
                        >
                            <Upload className="h-4 w-4" />
                            Submit
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex h-screen">
                {/* Left Panel */}
                <div className="bg-white border-r border-gray-200" style={{ width: `${leftPanelWidth}%` }}>
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveTab('description')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg ${activeTab === 'description'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                            >
                                Description
                            </button>
                            <button
                                onClick={() => setActiveTab('submissions')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg ${activeTab === 'submissions'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                            >
                                Submissions
                            </button>
                        </div>
                    </div>

                    {activeTab === 'description' && (
                        <div className="p-6 overflow-y-auto" style={{ height: 'calc(100vh - 140px)' }}>
                            <div className="prose prose-sm max-w-none">
                                <p className="text-gray-700 leading-relaxed mb-6 whitespace-pre-line">
                                    {problemData.problemDetail.problemStatement}
                                </p>

                                <h4 className="font-semibold text-gray-900 mb-2">Constraints</h4>
                                <p className="text-gray-700 mb-6 font-mono text-sm">{problemData.problemDetail.constraints}</p>

                                {problemData.sampleTestcases.map((tc, i) => (
                                    <div key={tc.id} className="mb-6">
                                        <h4 className="font-semibold text-gray-900 mb-2">Example {i + 1}:</h4>
                                        <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm space-y-1">
                                            <div><strong>Input:</strong> {tc.input}</div>
                                            <div><strong>Output:</strong> {tc.output}</div>
                                            {tc.explanation && <div><strong>Explanation:</strong> {tc.explanation}</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'submissions' && (
                        <div className="p-6 overflow-y-auto" style={{ height: 'calc(100vh - 140px)' }}>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission History</h3>
                            <div className="space-y-4">
                                {submissions.length === 0 ? (
                                    <p className="text-gray-500">No submissions yet.</p>
                                ) : (
                                    submissions.map((s, i) => (
                                        <div key={i} className="flex justify-between items-center p-4 bg-white rounded-lg border">
                                            <div>
                                                <StatusBadge status={s.status} />
                                                <span className="text-sm text-gray-500">{s.date}</span>
                                            </div>
                                            <LanguageTag language={s.language} />
                                            <RuntimeDisplay runtime={s.runtime} />
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Resizer */}
                <div
                    className="w-1 bg-gray-300 hover:bg-gray-400 cursor-col-resize flex items-center justify-center"
                    onMouseDown={handleMouseDown('horizontal')}
                >
                    <GripVertical className="h-4 w-4 text-gray-500" />
                </div>

                {/* Right Panel */}
                <div className="flex flex-col right-panel" style={{ width: `${99.9 - leftPanelWidth}%` }}>
                    {/* Editor */}
                    <div className="bg-gray-200" style={{ height: `${editorHeight}%` }}>
                        <div className="p-6" style={{ height: 'calc(100% - 70px)' }}>
                            <div id="monaco-editor" className="h-full w-full rounded-lg border border-gray-300 bg-white" />
                        </div>
                    </div>

                    {/* Resizer */}
                    <div
                        className="h-1 bg-gray-300 hover:bg-gray-400 cursor-row-resize"
                        onMouseDown={handleMouseDown('vertical')}
                    >
                        <GripVertical className="h-4 w-4 text-gray-500 rotate-90 mx-auto" />
                    </div>

                    {/* Test Cases */}
                    <div className="bg-gray-200" style={{ height: `${99.9 - editorHeight}%` }}>
                        <div className="px-6 py-4 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Test Cases</h3>
                        </div>

                        <div className="px-6 py-3 bg-gray-100 border-b border-gray-200 flex gap-2">
                            {problemData.sampleTestcases.map(tc => (
                                <button
                                    key={tc.id}
                                    onClick={() => setActiveTestCase(tc)}
                                    className={`px-3 py-1 text-sm rounded ${activeTestCase?.id === tc.id
                                        ? 'bg-white text-gray-900 shadow'
                                        : 'bg-gray-200 hover:bg-gray-300'
                                        }`}
                                >
                                    Sample {tc.id.slice(-4)}
                                </button>
                            ))}
                        </div>

                        <div className="p-6 overflow-y-auto" style={{ height: 'calc(100% - 140px)' }}>
                            {activeTestCase && (
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Input</h4>
                                        <pre className="bg-white p-3 rounded text-sm font-mono whitespace-pre-wrap">
                                            {activeTestCase.input}
                                        </pre>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Expected Output</h4>
                                        <pre className="bg-white p-3 rounded text-sm font-mono whitespace-pre-wrap">
                                            {activeTestCase.output}
                                        </pre>
                                    </div>

                                    {runResult && runResult.results && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Result</h4>
                                            {runResult.results.map((r, i) => (
                                                <div
                                                    key={i}
                                                    className={`p-3 rounded text-sm font-mono ${r.status === 'Accepted' ? 'bg-green-50 text-green-800 border border-green-200' :
                                                            r.status === 'Wrong Answer' ? 'bg-red-50 text-red-800 border border-red-200' :
                                                                'bg-yellow-50 text-yellow-800 border border-yellow-200'
                                                        }`}
                                                >
                                                    <div><strong>Status:</strong> {r.status}</div>
                                                    {r.output && <div><strong>Output:</strong> {r.output}</div>}
                                                    {r.error && <div><strong>Error:</strong> {r.error}</div>}
                                                    {r.compileError && <div><strong>Compile Error:</strong> {r.compileError}</div>}
                                                    {r.time && <div><strong>Time:</strong> {r.time} ms</div>}
                                                    {r.memory && <div><strong>Memory:</strong> {r.memory} KB</div>}
                                                </div>
                                            ))}
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

// Reusable components
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const color = status === 'Accepted' ? 'text-green-600' : status === 'Rejected' ? 'text-red-600' : 'text-yellow-600';
    return <span className={`font-semibold ${color}`}>{status}</span>;
};

const LanguageTag: React.FC<{ language: string }> = ({ language }) => (
    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">{language}</span>
);

const RuntimeDisplay: React.FC<{ runtime: number }> = ({ runtime }) => (
    <div className="flex items-center gap-1 text-gray-600">
        <Clock size={16} />
        <span className="text-sm">{runtime} ms</span>
    </div>
);

export default CodingProblemPage;