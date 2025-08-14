import { X } from 'lucide-react';

const FeedbackModal: React.FC<{
    feedback: string;
    onClose: () => void;
    position: { x: number; y: number };
}> = ({ feedback, onClose, position }) => (
    <div
        className="fixed bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-xs z-50"
        style={{
            left: Math.min(position.x, window.innerWidth - 300),
            top: position.y - 100,
        }}
    >
        <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-sm text-gray-800">Feedback</h4>
            <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1"
            >
                <X size={14} />
            </button>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">{feedback}</p>
    </div>
);

export default FeedbackModal;