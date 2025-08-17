import { useState } from "react";
import { Plus, X } from "lucide-react";

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  suggestions?: string[];
  disabled?: boolean;
}

const TagInput: React.FC<TagInputProps> = ({ tags, onTagsChange, suggestions = [], disabled = false }) => {
  const [inputValue, setInputValue] = useState('');
  const [showInput, setShowInput] = useState(false);

  const addTag = (tag: string) => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      onTagsChange([...tags, tag.trim()]);
    }
    setInputValue('');
    setShowInput(false);
  };

  const removeTag = (index: number) => {
    onTagsChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    }
    if (e.key === 'Escape') {
      setInputValue('');
      setShowInput(false);
    }
  };

  const handleAddFromSuggestion = (suggestion: string) => {
    addTag(suggestion);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Tags (optional)
      </label>
      
      <div className="p-3 bg-gray-100 rounded-md">
        <div className="flex flex-wrap items-center gap-2">
          {/* Display selected tags */}
          {tags.map((tag, index) => (
            <span 
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-white text-gray-700 rounded-md text-sm border border-gray-200"
            >
              {tag}
              {!disabled && (
                <button
                  onClick={() => removeTag(index)}
                  className="hover:bg-gray-100 rounded-full p-0.5 transition-colors"
                >
                  <X size={12} />
                </button>
              )}
            </span>
          ))}
          
          {/* Display available suggestions */}
          {!disabled && suggestions
            .filter(suggestion => !tags.includes(suggestion))
            .map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleAddFromSuggestion(suggestion)}
                className="px-3 py-1 bg-white text-gray-600 rounded-md text-sm border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                {suggestion}
              </button>
            ))
          }
          
          {/* Add button or input */}
          {!disabled && (
            <>
              {!showInput ? (
                <button
                  onClick={() => setShowInput(true)}
                  className="w-6 h-6 bg-white text-gray-600 rounded-md flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
                >
                  <Plus size={14} />
                </button>
              ) : (
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onBlur={() => {
                    if (inputValue.trim()) {
                      addTag(inputValue);
                    } else {
                      setShowInput(false);
                    }
                  }}
                  placeholder="Enter tag"
                  autoFocus
                  className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-20"
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TagInput;