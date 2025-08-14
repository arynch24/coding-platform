const StatCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: string | number;
    bgColor: string;
}> = ({ icon, title, value, bgColor }) => (
    <div className={`${bgColor} p-6 rounded-lg text-white`}>
        <div className="flex items-center gap-3 mb-2">
            {icon}
            <span className="text-sm font-medium">{title}</span>
        </div>
        <div className="text-3xl font-bold">{value}</div>
    </div>
);

export default StatCard;