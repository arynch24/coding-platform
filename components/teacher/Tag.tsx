import { X } from "lucide-react";
// Tag Component
interface TagProps {
    tag: string;
    onRemove?: () => void;
    disabled?: boolean;
}

const Tag: React.FC<TagProps> = ({ tag, onRemove, disabled = false }) => (
    <span className="inline-flex items-center gap-1 px-3 py-1 bg-white text-gray-700 rounded-md text-sm border border-gray-200">
        {tag}
        {onRemove && !disabled && (
            <button
                onClick={onRemove}
                className="hover:bg-gray-100 rounded-full p-0.5 transition-colors"
            >
                <X size={12} />
            </button>
        )}
    </span>
);

export default Tag;