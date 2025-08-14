// Button Component
const Button: React.FC<{
    children: React.ReactNode;
    variant?: 'primary' | 'secondary';
    onClick?: () => void;
    disabled?: boolean;
}> = ({ children, variant = 'primary', onClick, disabled = false }) => {
    const baseClasses = "px-4 py-2 rounded text-sm font-medium transition-colors";
    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400",
        secondary: "bg-gray-500 text-white hover:bg-gray-600 disabled:bg-gray-400"
    };

    return (
        <button
            className={`${baseClasses} ${variants[variant]}`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default Button;