import React from 'react';
import { AlertCircle, Trophy, Lock } from 'lucide-react';
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
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).replace(',', '');
    } catch (error) {
      return dateString;
    }
  };

  // Function to format date for display
  const formatDisplayDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const time = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      return { day, time };
    } catch (error) {
      return { day: dateString, time: '' };
    }
  };

  const handleRowClick = (result: ExamResult) => {
    if (result.isPublished) {
      router.push(`/coding/leaderboard/${result.id}`);
    }
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-gray-700 w-2/5">Exam</th>
              <th className="text-left p-4 text-sm font-medium text-gray-700 w-1/5">Date & timing</th>
              <th className="text-left p-4 text-sm font-medium text-gray-700 w-1/6">Score</th>
              <th className="text-left p-4 text-sm font-medium text-gray-700 w-1/6">Rank</th>
              <th className="text-left p-4 text-sm font-medium text-gray-700 w-1/6">Solved</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {results.map((result, index) => (
              <tr
                key={result.id}
                className={`
                  transition-colors duration-200 
                  ${result.isPublished
                    ? 'cursor-pointer hover:bg-gray-50'
                    : 'cursor-not-allowed opacity-60'
                  }
                `}
                onClick={() => handleRowClick(result)}
              >
                <td className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-1 h-12 bg-gradient-to-br from-qc-dark to-qc-dark/80 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md"></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 text-sm truncate">
                          {result.examName}
                        </h3>
                        {result.isPublished ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                            Results Pending
                          </span>
                        )}
                      </div>
                      {result.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                          {result.isPublished
                            ? result.description
                            : "Results are being evaluated by your teacher. Please check back later."
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                <td className="p-4">
                  {(() => {
                    const { day, time } = formatDisplayDate(result.dateTime);
                    return (
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{day}</div>
                        <div className="text-gray-500 text-xs">{time}</div>
                      </div>
                    );
                  })()}
                </td>

                <td className="p-4">
                  {result.isPublished ? (
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">
                        {result.score}/{result.maximumPossibleScore}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Lock size={12} />
                      <span>--</span>
                    </div>
                  )}
                </td>

                <td className="p-4">
                  {result.isPublished ? (
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                      <Trophy size={12} />
                      #{result.rank}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Lock size={12} />
                      <span>--</span>
                    </div>
                  )}
                </td>

                <td className="p-4">
                  {result.isPublished ? (
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {result.solved}/{result.total}
                      </div>
                      <div className="text-xs text-gray-500">Solved</div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-xs text-gray-400 justify-center">
                        <Lock size={12} />
                        <span>--</span>
                      </div>
                      <div className="text-xs text-gray-500">Pending</div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {results.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="flex flex-col items-center gap-3">
            <AlertCircle size={32} className="text-gray-300" />
            <p className="text-sm font-medium">No exam results available</p>
            <p className="text-xs text-gray-400">Check back later for your exam results</p>
          </div>
        </div>
      )}
    </div>
  )
};

export default ExamTable;