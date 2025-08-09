import { StatsCardProps } from '../types/dashboard';

const StatsCard: React.FC<StatsCardProps> = ({ icon, value, label }) => (
    <div className="bg-qc-dark rounded-lg p-4 text-white">
        <div className="flex items-center justify-center mb-2">
            {icon}
        </div>
        <div className="text-2xl font-bold text-center">{value}</div>
        <div className="text-sm text-center text-slate-300">{label}</div>
    </div>
);

export default StatsCard;