import React from 'react';
import { AlertCircle } from 'lucide-react';
import { ExamResult } from '@/types/dashboard';
import { useRouter } from 'next/navigation';

const ExamTable: React.FC<{
  results: ExamResult[];
  onFeedbackClick: (feedback: string, event: React.MouseEvent) => void;
  onClick?: (event: React.MouseEvent) => void;
}> = ({ results, onFeedbackClick }) => {

  const router = useRouter();
  console.log('ExamTable Results:', results);

  // Function to format date without seconds
  const formatDateWithoutSeconds = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-gray-700 w-1/4">Exam</th>
              <th className="text-left p-4 text-sm font-medium text-gray-700 w-1/6">Date & Time</th>
              <th className="text-left p-4 text-sm font-medium text-gray-700 w-1/6">Score</th>
              <th className="text-left p-4 text-sm font-medium text-gray-700 w-1/8">Rank</th>
              <th className="text-left p-4 text-sm font-medium text-gray-700 w-1/8">Solved</th>
              <th className="text-left p-4 text-sm font-medium text-gray-700 w-1/8">Feedback</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr 
                key={result.id} 
                className='bg-white border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors duration-200'
                onClick={() => router.push(`/coding/leaderboard/exam-id`)}
              >
                <td className="p-4">
                  <div className="font-medium text-sm text-gray-900 mb-1 truncate">
                    {result.examName}
                  </div>
                  {result.description && (
                    <div className="text-xs text-gray-400 line-clamp-2">
                      {result.description}
                    </div>
                  )}
                </td>
                <td className="p-4 text-sm text-gray-700">
                  {formatDateWithoutSeconds(result.dateTime)}
                </td>
                <td className="p-4 text-sm text-gray-700">
                  <span className="font-medium">{result.score}</span>
                  <span className="text-gray-500">/{result.maximumPossibleScore}</span>
                </td>
                <td className="p-4 text-sm text-gray-700">
                  <span className="font-medium">#{result.finalRank}</span>
                </td>
                <td className="p-4 text-sm text-gray-700">
                  <span className="font-medium">{result.solved}</span>
                  <span className="text-gray-500">/{result.total}</span>
                </td>
                <td className="p-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onFeedbackClick(result.feedback || '', e);
                    }}
                    className="bg-gray-800 text-white px-3 py-2 rounded-md text-xs font-medium hover:bg-gray-900 transition-colors flex items-center justify-center gap-1 min-w-[40px] h-8"
                  >
                    <AlertCircle size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {results.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No exam results available</p>
        </div>
      )}
    </div>
  )
};

export default ExamTable;