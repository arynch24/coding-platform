import { Question, MenuItem } from '@/types/dashboard';
import Badge from './ui/Badge';
import DropdownMenu from './MenuItem';
import { Eye, Edit, Trash, Check, User, Lock } from 'lucide-react';

const QuestionCard: React.FC<{
  question: Question;
  onClick: (questionId: string) => void;
  role: string;
  handleEdit?: (questionId: string) => void;
  handleDelete?: (questionId: string) => void;
}> = ({ question, onClick, role, handleDelete, handleEdit }) => {

  const menuItems: MenuItem[] = [
    {
      id: 'view',
      label: 'View',
      action: () => onClick(question.id),
      icon: <Eye className="text-blue-500" size={16} />
    },
    ...(question.isOwner ? [
      {
        id: 'edit',
        label: 'Edit',
        action: () => handleEdit?.(question.id),
        icon: <Edit className="text-green-500" size={16} />
      },
      {
        id: 'delete',
        label: 'Delete',
        action: () => handleDelete?.(question.id),
        icon: <Trash className="text-red-500" size={16} />,
      }
    ] : [])
  ];

  const getDifficultyVariant = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'easy': return 'easy';
      case 'medium': return 'medium';
      case 'hard': return 'hard';
      default: return 'default';
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-qc-dark/30 transition-all duration-200 hover:shadow-md group">
      <div className="flex items-start justify-between">
        <div className="flex-1 cursor-pointer" onClick={() => onClick(question.id)}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
              #{question.number}
            </span>
            {question.isSolved && (
              <div className="flex items-center gap-1 text-green-600 text-xs">
                <Check size={14} />
                <span>Solved</span>
              </div>
            )}
            {!question.isOwner && (
              <div className="flex items-center gap-1 text-blue-600 text-xs">
                <User size={12} />
                <span>by {question.creator?.name || 'Unknown'}</span>
              </div>
            )}
          </div>
          
          <h3 className="text-qc-dark font-medium group-hover:text-qc-dark/80 transition-colors mb-2">
            {question.title}
          </h3>
          
          <div className="flex flex-wrap gap-2 mb-2">
            {question.topics.slice(0, 3).map((topic, index) => (
              <span
                key={index}
                className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
              >
                {topic}
              </span>
            ))}
            {question.topics.length > 3 && (
              <span className="text-xs text-gray-500">
                +{question.topics.length - 3} more
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 ml-4">
          <Badge variant={getDifficultyVariant(question.difficulty)}>
            {question.difficulty}
          </Badge>
          
          {role === 'teacher' && (
            <div className="flex items-center gap-2">
              {!question.isOwner && (
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Lock size={12} />
                </div>
              )}
              <DropdownMenu items={menuItems} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;