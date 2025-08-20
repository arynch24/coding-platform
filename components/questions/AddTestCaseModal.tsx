import React, { useState } from 'react';
import { Button } from '../ui/Button';

interface AddTestCaseModalProps {
    onClose: () => void;
    onAdd: (testCase: {
        inputFile: File;
        outputFile: File;
        weight: number;
        isSample: boolean;
        explanation: string;
    }) => void;
    isLoading?: boolean;
}

const AddTestCaseModal: React.FC<AddTestCaseModalProps> = ({
    onClose,
    onAdd,
    isLoading = false
}) => {
    const [inputFile, setInputFile] = useState<File | null>(null);
    const [outputFile, setOutputFile] = useState<File | null>(null);
    const [weight, setWeight] = useState(1);
    const [isSample, setIsSample] = useState(false);
    const [explanation, setExplanation] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!inputFile) {
            newErrors.inputFile = 'Input file is required';
        }

        if (!outputFile) {
            newErrors.outputFile = 'Output file is required';
        }

        if (weight < 1 || weight > 100) {
            newErrors.weight = 'weight must be between 1 and 100';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        onAdd({
            inputFile: inputFile!,
            outputFile: outputFile!,
            weight,
            isSample,
            explanation
        });
    };

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        type: 'input' | 'output'
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type (should be text files)
            const validTypes = ['text/plain', 'application/octet-stream'];
            const validExtensions = ['.txt', '.in', '.out'];

            const isValidType = validTypes.includes(file.type) ||
                validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

            if (!isValidType) {
                setErrors(prev => ({
                    ...prev,
                    [type === 'input' ? 'inputFile' : 'outputFile']:
                        'Please upload a valid text file (.txt, .in, .out)'
                }));
                return;
            }

            if (type === 'input') {
                setInputFile(file);
                setErrors(prev => ({ ...prev, inputFile: '' }));
            } else {
                setOutputFile(file);
                setErrors(prev => ({ ...prev, outputFile: '' }));
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Add Test Case</h3>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Input File *
                        </label>
                        <input
                            type="file"
                            accept=".txt,.in,.out"
                            onChange={(e) => handleFileChange(e, 'input')}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            disabled={isLoading}
                        />
                        {inputFile && (
                            <p className="mt-1 text-sm text-gray-600">
                                Selected: {inputFile.name} ({(inputFile.size / 1024).toFixed(1)} KB)
                            </p>
                        )}
                        {errors.inputFile && (
                            <p className="mt-1 text-sm text-red-600">{errors.inputFile}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Output File *
                        </label>
                        <input
                            type="file"
                            accept=".txt,.in,.out"
                            onChange={(e) => handleFileChange(e, 'output')}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            disabled={isLoading}
                        />
                        {outputFile && (
                            <p className="mt-1 text-sm text-gray-600">
                                Selected: {outputFile.name} ({(outputFile.size / 1024).toFixed(1)} KB)
                            </p>
                        )}
                        {errors.outputFile && (
                            <p className="mt-1 text-sm text-red-600">{errors.outputFile}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            weight (1-5)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="5"
                            value={weight}
                            onChange={(e) => {
                                setWeight(parseInt(e.target.value) || 1);
                                if (errors.weight) {
                                    setErrors(prev => ({ ...prev, weight: '' }));
                                }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isLoading}
                        />
                        {errors.weight && (
                            <p className="mt-1 text-sm text-red-600">{errors.weight}</p>
                        )}
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isSample"
                                checked={isSample}
                                onChange={(e) => setIsSample(e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                disabled={isLoading}
                            />
                            <label htmlFor="isSample" className="ml-2 block text-sm text-gray-900">
                                Sample Test Case
                                <span className="block text-xs text-gray-500">
                                    Visible to users for testing their solution
                                </span>
                            </label>
                        </div>

                        {isSample && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Explanation
                                </label>
                                <textarea
                                    value={explanation}
                                    onChange={(e) => setExplanation(e.target.value)}
                                    placeholder="Explain this test case for users..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                                    rows={3}
                                    disabled={isLoading}
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <Button
                            type="button"
                            onClick={onClose}
                            variant="outline"
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-green-600 hover:bg-green-700"
                            disabled={isLoading || !inputFile || !outputFile}
                        >
                            {isLoading ? 'Adding...' : 'Add Test Case'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTestCaseModal;