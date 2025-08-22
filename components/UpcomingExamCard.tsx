import { Calendar, Clock, User, Zap } from "lucide-react";

interface Tag {
    name: string;
    color: string;
}

interface UpcomingExam {
    id: string;
    title: string;
    description: string;
    tags: Tag[];
    date: string;
    time: string;
    duration: string;
    live: boolean;
    teacher?: string;
}

interface UpcomingExamCardProps {
    exam: UpcomingExam;
    handleJoin?: () => void;
    handleView?: () => void;
    role: string;
}

const UpcomingExamCard: React.FC<UpcomingExamCardProps> = ({
    exam,
    handleJoin,
    handleView,
    role
}) => {
    return (
        <div className="group bg-qc-dark/95 rounded-2xl p-6 text-white min-w-[320px] w-[430px] flex-shrink-0 shadow-sm hover:shadow-lg transition-all duration-300 border border-white/10">
            {/* Header Section */}
            <div className="mb-6">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold  text-white group-hover:text-gray-100 transition-colors">
                            {exam.title}
                        </h3>
                        <p className="text-gray-200 text-sm leading-relaxed line-clamp-2">
                            {exam.description}
                        </p>
                    </div>
                    <div className="">
                        <div className="flex mb-2 items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/20">
                            <Clock size={14} className="text-blue-200" />
                            <span className="text-xs font-medium text-blue-100">{exam.duration}</span>
                        </div>
                        {exam.live && (
                            <div className="flex items-center justify-end gap-2 ">
                                <span className=" flex items-center gap-2 bg-red-500/20 backdrop-blur-sm border border-red-400/30 text-red-100 text-xs font-semibold px-3 py-1 rounded-full">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75"></div>
                                        <div className="relative bg-red-500 w-2 h-2 rounded-full"></div>
                                    </div>
                                    LIVE
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tags Section */}
            <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                    {exam.tags.slice(0, 4).map((tag, index) => (
                        <div
                            key={index}
                            className="bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-full hover:bg-white/20 transition-colors"
                        >
                            {tag.name}
                        </div>
                    ))}
                    {exam.tags.length > 4 && (
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 text-gray-300 text-xs font-medium px-3 py-1.5 rounded-full">
                            +{exam.tags.length - 4} more
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Section */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                        <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-md px-2 py-1">
                            <Calendar size={12} className="text-blue-200" />
                            <span className="font-medium">{exam.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-md px-2 py-1">
                            <Clock size={12} className="text-green-200" />
                            <span className="font-medium">{exam.time}</span>
                        </div>
                    </div>

                    {role === "student" && exam.teacher && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-300">
                            <User size={12} className="text-purple-200" />
                            <span className="font-medium">By {exam.teacher}</span>
                        </div>
                    )}
                </div>

                <button
                    className={`group/btn relative overflow-hidden font-medium px-5 py-2.5 rounded-xl text-sm transition-all duration-300 transform hover:-translate-y-0.5 ${exam.live
                        ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white shadow-lg hover:shadow-red-500/25'
                        : 'bg-white text-gray-900 hover:bg-gray-100 shadow-lg hover:shadow-xl'
                        }`}
                    onClick={role === "teacher" ? handleView : handleJoin}
                >
                    <span className="relative z-10 flex items-center gap-2">
                        {exam.live && <Zap size={14} className="animate-pulse" />}
                        {role === "teacher" ? "View " : (exam.live ? "Join Now" : "Join")}
                    </span>

                    {/* Animated background for live contests */}
                    {exam.live && (
                        <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                    )}
                </button>
            </div>
        </div>
    );
};

export default UpcomingExamCard;