import { Problem } from '@/types/dashboard';
import { Check, X } from 'lucide-react';

const ProblemCard: React.FC<{ problem: Problem, handleQuestion: () => void }> = ({ problem, handleQuestion }) => {
    return (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={handleQuestion}>
            <div className="flex justify-between items-center">
                <span className="text-gray-800 font-medium">{problem.id}. {problem.title}</span>
                <div className='flex gap-2'>
                    {problem.isSolved ? (
                        <Check className="text-green-500" />
                    ) : (
                        <X className="text-red-500" />
                    )}

                    <span className="text-gray-600 font-semibold">{problem.points} points</span>
                </div>
            </div>
        </div>
    )
};

export default ProblemCard;