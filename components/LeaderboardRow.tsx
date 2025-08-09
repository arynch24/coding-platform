import { LeaderboardEntry } from "@/types/dashboard";

const LeaderboardRow: React.FC<{ entry: LeaderboardEntry }> = ({ entry }) => (
    <div className="flex justify-between items-center py-3 px-4 border-b border-gray-200 last:border-b-0">
        <div className="flex items-center gap-3">
            <span className="text-gray-600 font-medium">{entry.rank}.</span>
            <span className="text-gray-800">{entry.name}</span>
        </div>
        <div className="flex items-center gap-4">
            <span className="text-gray-600">{entry.solved}</span>
            <span className="font-semibold text-gray-800">{entry.score}</span>
        </div>
    </div>
);

export default LeaderboardRow;