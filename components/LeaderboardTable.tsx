import React from 'react';
import { AlertCircle } from 'lucide-react';
import { ExamResult } from '@/types/dashboard';

const ExamTable: React.FC<{
    results: ExamResult[];
    onFeedbackClick: (feedback: string, event: React.MouseEvent) => void;
  }> = ({ results, onFeedbackClick }) => (
    <div className="bg-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-gray-700">Exam</th>
              <th className="text-left p-4 text-sm font-medium text-gray-700">Date & timing</th>
              <th className="text-left p-4 text-sm font-medium text-gray-700">Score (#rank)</th>
              <th className="text-left p-4 text-sm font-medium text-gray-700">Final score (#rank)</th>
              <th className="text-left p-4 text-sm font-medium text-gray-700">Solved</th>
              <th className="text-left p-4 text-sm font-medium text-gray-700">Feedback</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={result.id} className= 'bg-white border border-gray-200' >
                <td className="p-4">
                  <div className="font-medium text-sm text-gray-900">{result.examName}</div>
                  <div className="text-xs text-gray-500">{result.subject}</div>
                </td>
                <td className="p-4 text-sm text-gray-700">{result.dateTime}</td>
                <td className="p-4 text-sm text-gray-700">
                  {result.score} (#{result.rank})
                </td>
                <td className="p-4 text-sm text-gray-700">
                  {result.finalScore} (#{result.finalRank})
                </td>
                <td className="p-4 text-sm text-gray-700">
                  {result.solved}/{result.total}
                </td>
                <td className="p-4">
                  <button
                    onClick={(e) => onFeedbackClick(result.feedback, e)}
                    className="bg-black text-white px-3 py-1 rounded text-xs font-medium hover:bg-gray-800 transition-colors flex items-center gap-1"
                  >
                    <AlertCircle size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  export default ExamTable;