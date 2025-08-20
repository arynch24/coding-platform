import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import AddTestCaseModal from './AddTestCaseModal';
import axios from 'axios';
import ViewTestCaseModal from './ViewTestCaseModal';

// Configure axios defaults
axios.defaults.withCredentials = true;

interface TestCase {
    id: string;
    order: number;
    inputFilename?: string;
    outputFilename?: string;
    input?: {
        key: string;
        url: string;
    };
    output?: {
        key: string;
        url: string;
    };
    weight: number;
    isSample: boolean;
    explanation: string;
}

interface TestCasesTabProps {
    questionId: string;
    onDataChange: () => void;
}

interface TestCaseData {
    id: string;
    isSample: boolean;
    input: string;
    output: string;
    weight: number;
    explanation?: string;
}

export const TestCasesTab: React.FC<TestCasesTabProps> = ({
    questionId,
    onDataChange,
}) => {
    const [testCases, setTestCases] = useState<TestCase[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<string>('');
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewingTestCase, setViewingTestCase] = useState<TestCaseData | null>(null);

    useEffect(() => {
        fetchTestCases();
    }, [questionId]);

    const fetchTestCases = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/testcases/all/${questionId}`, {
                withCredentials: true
            });
            setTestCases(response.data.data || []);
        } catch (error) {
            console.error('Error fetching test cases:', error);
        }
    };

    const handleAddTestCase = () => {
        setShowAddModal(true);
    };

    const uploadFileToS3 = async (presignedUrl: string, file: File) => {
        try {
            await axios.put(presignedUrl, file, {
                headers: {
                    'Content-Type': 'text/plain',
                },
                withCredentials: false // S3 presigned URLs don't need credentials
            });
            return true;
        } catch (error) {
            console.error('Error uploading file to S3:', error);
            return false;
        }
    };

    const removeTestCase = async (testCaseId: string) => {
        try {
            const response = await axios.delete(
                `${process.env.NEXT_PUBLIC_API_URL}/testcases/${testCaseId}`,
                { withCredentials: true }
            );

            if (response.status === 200) {
                setTestCases(prev => prev.filter(tc => tc.id !== testCaseId));
                onDataChange();
            }
        } catch (error) {
            console.error('Error removing test case:', error);
        }
    };

    const handleAddTestCaseFromModal = async (testCaseData: {
        inputFile: File;
        outputFile: File;
        weight: number;
        isSample: boolean;
        explanation: string;
    }) => {
        try {
            setIsLoading(true);

            // Generate unique filenames
            const inputFilename = `input_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.txt`;
            const outputFilename = `output_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.txt`;

            // Get presigned URLs
            const presignResponse = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/testcases/${questionId}/presign`,
                {
                    inputFilename,
                    outputFilename
                },
                { withCredentials: true }
            );

            const { inputUploadUrl, outputUploadUrl } = presignResponse.data.data;

            // Upload files to S3
            const inputSuccess = await uploadFileToS3(inputUploadUrl, testCaseData.inputFile);
            const outputSuccess = await uploadFileToS3(outputUploadUrl, testCaseData.outputFile);

            if (!inputSuccess || !outputSuccess) {
                throw new Error('Failed to upload files');
            }

            // Save metadata to database
            const createResponse = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/testcases/`,
                {
                    testcases: [{
                        problemId: questionId,
                        input: inputFilename,
                        output: outputFilename,
                        weight: testCaseData.weight,
                        isSample: testCaseData.isSample,
                        explanation: testCaseData.explanation,
                    }]
                },
                { withCredentials: true }
            );

            if (createResponse.status === 201) {
                fetchTestCases();
                onDataChange();
                setShowAddModal(false);
            }
        } catch (error) {
            console.error('Error adding test case:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const viewTestCase = async (testCaseId: string) => {
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/testcases/${testCaseId}`,
                { withCredentials: true }
            );

            const testCaseData = response.data.data;
            setViewingTestCase(testCaseData);
            setShowViewModal(true);
        } catch (error) {
            console.error('Error fetching test case:', error);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">Test Cases</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Add test cases to judge the correctness of user's code.{' '}
                        <a href="#" className="text-navy-600 hover:text-navy-700">
                            Refer to these instructions
                        </a>{' '}
                        to write a good test case.
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        <a href="#" className="text-navy-600 hover:text-navy-700">
                            Download sample test cases from Hello World challenge
                        </a>{' '}
                        to understand the .zip format.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={handleAddTestCase}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={isLoading}
                    >
                        + Add Test Case
                    </Button>
                </div>
            </div>

            {uploadProgress && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-blue-800 text-sm">{uploadProgress}</p>
                </div>
            )}

            {testCases.length === 0 ? (
                <div className="text-center py-12">
                    <div className="bg-orange-100 border border-orange-300 rounded-md p-4 mb-6 inline-block">
                        <p className="text-orange-800 text-sm">
                            ⚠️ You do not have any test cases for this challenge. Add at least one test case.
                        </p>
                    </div>
                    <p className="text-gray-500">No test cases have been added yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="grid grid-cols-8 gap-4 py-3 px-4 bg-gray-50 rounded-lg text-sm font-medium text-gray-700">
                        <div>Order</div>
                        <div>Input</div>
                        <div>Output</div>
                        <div>Sample</div>
                        <div>Explanation</div>
                        <div>Weight</div>
                        <div>Actions</div>
                        <div>View</div>
                    </div>

                    {testCases.map(testCase => (
                        <div key={testCase.id} className="grid grid-cols-8 gap-4 py-3 px-4 border border-gray-200 rounded-lg">
                            <div className="text-sm text-gray-600">{testCases.findIndex(tc => tc.id === testCase.id) + 1}</div>
                            <div className="text-sm text-gray-600">
                                {testCase.input?.url ? (
                                    <a
                                        href={testCase.input.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        Input File
                                    </a>
                                ) : (
                                    testCase.inputFilename || 'No file'
                                )}
                            </div>
                            <div className="text-sm text-gray-600">
                                {testCase.output?.url ? (
                                    <a
                                        href={testCase.output.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        Output File
                                    </a>
                                ) : (
                                    testCase.outputFilename || 'No file'
                                )}
                            </div>
                            <div className="text-sm text-gray-600">{testCase.isSample ? '✓' : ''}</div>
                            <div className="text-sm text-gray-600">{testCase.explanation || 'No explanation'}</div>
                            <div className="text-sm text-gray-600">{testCase.weight}</div>
                            <div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeTestCase(testCase.id)}
                                    className="text-red-600 hover:text-red-700"
                                    disabled={isLoading}
                                >
                                    Remove
                                </Button>
                            </div>
                            <div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => viewTestCase(testCase.id)}
                                    className="text-blue-600 hover:text-blue-700"
                                >
                                    View
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-8">
                <p className="text-sm text-gray-600">
                    You will get <span className="bg-yellow-200 px-1">0.00%</span> of the maximum score if you pass the selected test cases.
                </p>
            </div>
            {showAddModal && (
                <AddTestCaseModal
                    onClose={() => setShowAddModal(false)}
                    onAdd={handleAddTestCaseFromModal}
                    isLoading={isLoading}
                />
            )}
            {showViewModal && (
                <ViewTestCaseModal
                    testCase={viewingTestCase}
                    onClose={() => {
                        setShowViewModal(false);
                        setViewingTestCase(null);
                    }}
                />
            )}
        </div>
    );
};

export default TestCasesTab;