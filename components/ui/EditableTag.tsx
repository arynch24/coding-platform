interface TagProps {
  children: React.ReactNode;
  onRemove?: () => void;
  variant?: 'default' | 'removable';
}

export const Tag: React.FC<TagProps> = ({ children, onRemove, variant = 'default' }) => {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
      {children}
      {variant === 'removable' && onRemove && (
        <button
          onClick={onRemove}
          className="ml-2 text-blue-500 hover:text-blue-700"
        >
          ×
        </button>
      )}
    </span>
  );
};