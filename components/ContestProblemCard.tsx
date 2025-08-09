import { Problem } from '@/types/dashboard';

const ProblemCard: React.FC<{ problem: Problem, handleQuestion: () => void }> = ({ problem, handleQuestion }) => {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleQuestion}>
        <div className="flex justify-between items-center">
          <span className="text-gray-800 font-medium">{problem.id}. {problem.title}</span>
          <span className="text-gray-600 font-semibold">{problem.points} points</span>
        </div>
      </div>
    )
  };

  export default ProblemCard;