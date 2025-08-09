import ExamTag from "./ExamTag";
import { Calendar, Clock } from "lucide-react";
import { UpcomingExam } from "@/types/dashboard";

const UpcomingExamCard: React.FC<{ exam: UpcomingExam, handleJoin: () => void }> = ({ exam, handleJoin }) => (
    <div className="bg-qc-dark rounded-2xl p-5 text-white min-w-[300px] max-w-[320px] flex-shrink-0">
        <div className="mb-5">
            <h3 className="text-lg font-semibold mb-2">{exam.title}</h3>
            <p className="text-zinc-100 text-sm leading-relaxed">{exam.description}</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
            {exam.tags.map((tag, index) => (
                <ExamTag key={index} tag={tag} />
            ))}
        </div>

        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-zinc-100">
                <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{exam.date} {exam.time}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{exam.duration}</span>
                </div>
            </div>
            <button className="bg-white text-slate-800 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors cursor-pointer"
                onClick={handleJoin}
            >
                Join
            </button>
        </div>
    </div>
);

export default UpcomingExamCard;