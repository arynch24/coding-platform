const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button
        onClick={onClick}
        className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors"
    >
        <span className="mr-2 text-lg">←</span>
        <span>Back to Management</span>
    </button>
);

export default BackButton;