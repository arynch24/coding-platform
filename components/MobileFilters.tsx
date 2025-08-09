const difficultyOptions = ['All difficulties', 'Easy', 'Medium', 'Hard'];
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


const MobileFilters: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    difficultyFilter: string;
    topicFilter: string;
    onDifficultyChange: (difficulty: string) => void;
    onTopicChange: (topic: string) => void;
  }> = ({ isOpen, onClose, difficultyFilter, topicFilter, onDifficultyChange, onTopicChange }) => {
    if (!isOpen) return null;
  
    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={onClose} />
        <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 z-50 md:hidden">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <div className="space-y-2">
                {difficultyOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => onDifficultyChange(option)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      difficultyFilter === option 
                        ? 'bg-blue-100 text-blue-700 font-medium' 
                        : 'bg-qc-light/10 text-gray-700 hover:bg-qc-light/20'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {topicOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => onTopicChange(option)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      topicFilter === option 
                        ? 'bg-blue-100 text-blue-700 font-medium' 
                        : 'bg-qc-light/10 text-gray-700 hover:bg-qc-light/20'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-full mt-6 py-3 bg-qc-dark text-white rounded-lg hover:bg-qc-dark/95 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </>
    );
  };

export default MobileFilters;