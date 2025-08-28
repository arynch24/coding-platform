import React from 'react';
import { Button } from '../ui/Button';

interface TestCaseData {
    id: string;
    isSample: boolean;
    input: string;
    output: string;
    weight: number;
    explanation?: string;
}

interface ViewTestCaseModalProps {
    testCase: TestCaseData | null;
    onClose: () => void;
}

const ViewTestCaseModal: React.FC<ViewTestCaseModalProps> = ({ testCase, onClose }) => {
    if (!testCase) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Test Case Details</h3>
                </div>

                <div className="px-6 py-4 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Input
                            </label>
                            <textarea
                                value={testCase.input || ''}
                                readOnly
                                className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Output
                            </label>
                            <textarea
                                value={testCase.output || ''}
                                readOnly
                                className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm resize-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Weight
                            </label>
                            <input
                                type="text"
                                value={testCase.weight || ''}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sample Test Case
                            </label>
                            <input
                                type="text"
                                value={testCase.isSample ? 'Yes' : 'No'}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                            />
                        </div>
                        {/* <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ID
                            </label>
                            <input
                                type="text"
                                value={testCase.id || ''}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-xs"
                            />
                        </div> */}
                    </div>

                    {testCase.explanation && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Explanation
                            </label>
                            <textarea
                                value={testCase.explanation}
                                readOnly
                                className="w-full h-20 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 resize-none"
                            />
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                    <Button
                        onClick={onClose}
                        variant="outline"
                    >
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ViewTestCaseModal;