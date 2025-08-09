import { CheckCircle } from 'lucide-react';
import {PastExam} from '@/types/dashboard';

const PastExamRow: React.FC<{ exam: PastExam; isLast: boolean }> = ({ exam, isLast }) => {
    const solvedCount = parseInt(exam.solved.split('/')[0]);
    const totalCount = parseInt(exam.solved.split('/')[1]);
    const solvedPercentage = (solvedCount / totalCount) * 100;

    return (
        <div className={`grid grid-cols-4 gap-4 py-4 px-4 ${!isLast ? 'border-b border-gray-200' : ''}`}>
            <div>
                <h4 className="font-semibold text-qc-primary mb-1 text-sm">{exam.title}</h4>
                <p className="text-xs text-zinc-600">{exam.description}</p>
            </div>

            <div className="text-qc-primary text-sm">
                <p>{exam.date} {exam.time}</p>
            </div>

            <div className="text-center">
                <span className="inline-flex items-center justify-center w-10 h-6 bg-gray-100 text-gray-800 rounded text-xs font-semibold">
                    #{exam.rank}
                </span>
            </div>

            <div className="text-center">
                <div className="inline-flex items-center justify-center px-3 py-1 bg-gray-100 rounded text-xs">
                    <span className="font-semibold text-qc-primary">{exam.solved}</span>
                    {solvedPercentage === 100 && (
                        <CheckCircle className="ml-1 text-green-500" size={12} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default PastExamRow;