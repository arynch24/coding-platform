const Badge: React.FC<{
    children: React.ReactNode;
    variant?: 'default' | 'secondary' | 'easy' | 'medium' | 'hard'
}> = ({
    children,
    variant = 'default'
}) => {
        const getVariantClasses = () => {
            switch (variant) {
                case 'easy':
                    return 'bg-green-100 text-green-800 border-green-200 border';
                case 'medium':
                    return 'bg-blue-100 text-blue-800 border-blue-200 border';
                case 'hard':
                    return 'bg-red-100 text-red-800 border-red-200 border';
                case 'secondary':
                    return 'bg-gray-500 text-white';
                case 'default':
                    return 'bg-blue-600 text-white';
                default:
                    return 'bg-gray-100 text-gray-800 border-gray-200 border';
            }
        };

        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getVariantClasses()}`}>
                {children}
            </span>
        );
    };

export default Badge;