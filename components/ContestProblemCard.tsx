import Badge from "./ui/Badge";
import { Edit } from "lucide-react"; 

interface ProblemCardProps {
  number: number;
  title: string;
  points: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  role: 'teacher' | 'student';
  onClick: () => void;
  isSolved?: boolean; // Only used for teacher role
  onEdit?: () => void; // Only used for student role
}

const ProblemCard: React.FC<ProblemCardProps> = ({ 
  number, 
  title, 
  points, 
  difficulty, 
  role,
  onClick, 
  isSolved, 
  onEdit 
}) => {
  const getDifficultyVariant = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'easy': return 'easy';
      case 'medium': return 'medium';
      case 'hard': return 'hard';
      default: return 'default';
    }
  };

  return (
    <div
      className="bg-white rounded-lg p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        <span className="text-gray-600 font-medium">{number}.</span>
        <span className="text-gray-900 font-medium">{title}</span>
      </div>

      <div className="flex items-center space-x-4">
        {/* Teacher role: Show solved/unsolved status */}
        {role === 'student' && (
          <>
            {isSolved ? (
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </>
        )}

        {/* Student role: Show edit button */}
        {role === 'teacher' && onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Edit className="w-4 h-4 text-gray-600" />
          </button>
        )}

        <Badge variant={getDifficultyVariant(difficulty)}>
          {difficulty}
        </Badge>

        <span className="text-gray-900 font-semibold">{points} points</span>
      </div>
    </div>
  );
};

export default ProblemCard;