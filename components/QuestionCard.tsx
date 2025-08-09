import { Question } from '@/types/dashboard';
import DifficultyBadge from './DifficultyBadge';

const QuestionCard: React.FC<{ 
    question: Question; 
    onClick: (questionId: string) => void;
  }> = ({ question, onClick }) => (
    <div 
      onClick={() => onClick(question.id)}
      className="bg-qc-light/10 rounded-xl p-4 hover:bg-qc-light/20 transition-colors cursor-pointer group"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-qc-primary font-medium group-hover:text-qc-primary/90 transition-colors">
            {question.number}. {question.title}
          </h3>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-zinc-600 text-sm">
            {question.topics.join(', ')}
          </div>
          <DifficultyBadge difficulty={question.difficulty} />
        </div>
      </div>
    </div>
  );

export default QuestionCard;