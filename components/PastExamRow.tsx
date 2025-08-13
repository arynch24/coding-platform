import { PastExam, MenuItem } from '@/types/dashboard';
import DropdownMenu from './MenuItem';
import { Eye ,Trash} from 'lucide-react';

const PastExamRow: React.FC<{ exam: PastExam; isLast: boolean, role: string, handleView?: () => void, handleDelete?: () => void }> = ({ exam, isLast, role, handleView, handleDelete }) => {

    const menuItems: MenuItem[] = [
        {
            id: 'view',
            label: 'View',
            action: () => handleView,
            icon: <Eye className="text-blue-500"  size={16}/>
        },
        {
            id: 'delete',
            label: 'Delete',
            action: () => handleDelete,
            icon: <Trash className="text-red-500" size={16}/>,
        },

    ];


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
                    {role == "student" ? "#" + exam.rank : exam.totalParticipants}
                </span>
            </div>

            <div className="text-center">
                {
                    role == "student" ?
                        <div className="inline-flex items-center justify-center px-3 py-1 bg-gray-100 rounded text-xs">
                            <span className="font-semibold text-qc-primary">{exam.solved}</span>
                        </div>
                        : <div>
                            <DropdownMenu items={menuItems} />
                        </div>
                }
            </div>
        </div>
    );
};

export default PastExamRow;