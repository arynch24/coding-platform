import { Question, MenuItem } from '@/types/dashboard';
import DifficultyBadge from './DifficultyBadge';
import DropdownMenu from './MenuItem';
import { Eye, Trash, Check } from 'lucide-react';


const QuestionCard: React.FC<{
  question: Question;
  onClick: (questionId: string) => void;
  role: string;
  handleEdit?: (questionId: string) => void;
  handleDelete?: (questionId: string) => void;
}> = ({ question, onClick, role, handleDelete, handleEdit }) => {

  const menuItems: MenuItem[] = [
    {
      id: 'edit',
      label: 'Edit',
      action: () => handleEdit,
      icon: <Eye className="text-blue-500" size={16} />
    },
    {
      id: 'delete',
      label: 'Delete',
      action: () => handleDelete,
      icon: <Trash className="text-red-500" size={16} />,
    },
  ];

  return (<div

    className="bg-qc-light/10 rounded-xl p-4 hover:bg-qc-light/20 transition-colors  group"
  >
    <div className="flex items-center justify-between">
      <div className="flex-1 cursor-pointer"
        onClick={() => onClick(question.id)}>
        <h3 className="text-qc-primary font-medium group-hover:text-qc-primary/90 transition-colors">
          {question.number}. {question.title}
        </h3>
      </div>

      <div className="flex items-center gap-4">
        {question.isSolved && <Check className="text-green-500" size={16} />}
        <div className="text-zinc-600 text-sm">
          {question.topics.join(', ')}
        </div>
        <DifficultyBadge difficulty={question.difficulty} />
        {role === 'teacher' &&
          <DropdownMenu items={menuItems} />
        }
      </div>
    </div>
  </div>
  )
};

export default QuestionCard;