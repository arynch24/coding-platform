import { TestCase } from "@/types/dashboard";
import { Edit } from "lucide-react";

interface TestCaseDisplayProps {
    testCases: TestCase[];
    onEdit?: () => void;
    editable?: boolean;
}

const TestCaseDisplay: React.FC<TestCaseDisplayProps> = ({ testCases, onEdit, editable = true }) => (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
                Test Cases ({testCases.length})
            </span>
            {editable && onEdit && (
                <button
                    onClick={onEdit}
                    className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:text-blue-800 transition-colors"
                >
                    <Edit size={14} />
                    Edit Test Cases
                </button>
            )}
        </div>

        {testCases.length > 0 ? (
            <div className="space-y-2">
                {testCases.map((testCase) => (
                    <div key={testCase.id} className="flex items-center justify-between p-3 bg-gray-100 rounded-md">
                        <span className="text-gray-700">{testCase.name}</span>
                        <span className="text-sm text-gray-500">
                            {testCase.type === 'sample' ? 'Sample test' : `${testCase.points} points`}
                        </span>
                    </div>
                ))}
            </div>
        ) : (
            <div className="p-4 bg-gray-50 rounded-md text-center text-gray-500">
                No test cases uploaded yet
            </div>
        )}
    </div>
);

export default TestCaseDisplay;