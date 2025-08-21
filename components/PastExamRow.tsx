import { Eye, Trash, MoreVertical, Users, Award, CheckCircle, XCircle } from 'lucide-react';
import DropdownMenu from './MenuItem';
import { MenuItem } from '@/types/dashboard';

interface PastExam {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  rank?: number;
  solved?: string;
  totalProblems?: number;
  totalParticipants?: number;
  isPublished?: boolean;
}

interface PastExamRowProps {
  exam: PastExam;
  isLast: boolean;
  role: string;
  handleView?: () => void;
  handleDelete?: () => void;
}

const PastExamRow: React.FC<PastExamRowProps> = ({ 
  exam, 
  isLast, 
  role, 
  handleView, 
  handleDelete 
}) => {
  const menuItems: MenuItem[] = [
    {
      id: 'view',
      label: 'View Details',
      action: () => handleView?.(),
      icon: <Eye size={16} className="text-blue-500" />
    },
    {
      id: 'delete',
      label: 'Delete Contest',
      action: () => handleDelete?.(),
      icon: <Trash size={16} className="text-red-500" />,
      variant: 'danger'
    },
  ];

  return (
    <div className={`grid grid-cols-4 gap-4 py-5 px-6 hover:bg-gray-50/50 transition-all duration-200 group ${
      !isLast ? 'border-b border-gray-100' : ''
    }`}>
      {/* Contest Details */}
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-qc-dark to-qc-dark/80 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md">
          {exam.title.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900 text-sm truncate group-hover:text-qc-primary transition-colors">
              {exam.title}
            </h4>
            {exam.isPublished !== undefined && (
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                exam.isPublished 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {exam.isPublished ? (
                  <CheckCircle size={10} />
                ) : (
                  <XCircle size={10} />
                )}
                {exam.isPublished ? 'Published' : 'Draft'}
              </div>
            )}
          </div>
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
            {exam.description}
          </p>
        </div>
      </div>

      {/* Date & Time */}
      <div className="flex items-center justify-center">
        <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
          <p className="text-sm font-medium text-gray-900">{exam.date}</p>
          <p className="text-xs text-gray-600 mt-0.5">{exam.time}</p>
        </div>
      </div>

      {/* Participants/Rank */}
      <div className="flex items-center justify-center">
        {role === "student" ? (
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg px-3 py-2 text-center shadow-sm">
              <div className="flex items-center gap-1">
                <Award size={12} />
                <span className="font-bold text-sm">#{exam.rank}</span>
              </div>
              <p className="text-xs opacity-90">Rank</p>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-2 text-center min-w-[80px]">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users size={12} className="text-blue-600" />
              <span className="font-bold text-sm text-blue-800">{exam.totalParticipants || 0}</span>
            </div>
            <p className="text-xs text-blue-600 font-medium">Participants</p>
          </div>
        )}
      </div>

      {/* Actions/Score */}
      <div className="flex items-center justify-center">
        {role === "student" ? (
          <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-2 text-center min-w-[70px]">
            <div className="font-bold text-sm text-gray-900 mb-1">{exam.solved}</div>
            <p className="text-xs text-gray-600">Solved</p>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleView}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
            >
              <Eye size={14} />
              View
            </button>
            <DropdownMenu items={menuItems} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PastExamRow;