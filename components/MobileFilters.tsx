import React from 'react';
import { X } from 'lucide-react';

interface MobileFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  difficultyFilter: string;
  topicFilter: string;
  statusFilter: string;
  onDifficultyChange: (difficulty: string) => void;
  onTopicChange: (topic: string) => void;
  onStatusChange: (status: string) => void;
}

const MobileFilters: React.FC<MobileFiltersProps> = ({
  isOpen,
  onClose,
  difficultyFilter,
  topicFilter,
  statusFilter,
  onDifficultyChange,
  onTopicChange,
  onStatusChange,
}) => {
  if (!isOpen) return null;

  const difficultyOptions = ['All difficulties', 'Easy', 'Medium', 'Hard'];
  const statusOptions = ['All Questions', 'My Questions', 'Public Questions'];
  
  // You'll need to pass topicOptions as props or generate them here
  const topicOptions = [
    'All Topics',
    'Array',
    'String',
    'Stack',
    'Tree',
    'Graph',
    'Heap',
    'Dynamic Programming',
    'Sorting',
    'BST',
    'BFS',
    'DFS',
    'Two Pointers'
  ];

  const clearAllFilters = () => {
    onDifficultyChange('All difficulties');
    onTopicChange('All Topics');
    onStatusChange('All Questions');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-qc-dark">Filters</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Filter Sections */}
        <div className="space-y-6">
          {/* Status Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Question Status</h3>
            <div className="grid grid-cols-1 gap-2">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => onStatusChange(status)}
                  className={`p-3 text-left rounded-lg border transition-colors ${
                    statusFilter === status
                      ? 'bg-qc-dark text-white border-qc-dark'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Difficulty</h3>
            <div className="grid grid-cols-2 gap-2">
              {difficultyOptions.map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => onDifficultyChange(difficulty)}
                  className={`p-3 text-center rounded-lg border transition-colors ${
                    difficultyFilter === difficulty
                      ? 'bg-qc-dark text-white border-qc-dark'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {difficulty}
                </button>
              ))}
            </div>
          </div>

          {/* Topic Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Topics</h3>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {topicOptions.map((topic) => (
                <button
                  key={topic}
                  onClick={() => onTopicChange(topic)}
                  className={`p-3 text-center rounded-lg border transition-colors ${
                    topicFilter === topic
                      ? 'bg-qc-dark text-white border-qc-dark'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={clearAllFilters}
            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-qc-dark text-white rounded-lg hover:bg-qc-dark/90 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileFilters;