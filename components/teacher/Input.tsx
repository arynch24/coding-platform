interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: 'text' | 'number';
  disabled?: boolean;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  type = 'text',
  disabled = false
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-3 py-2 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
        disabled ? 'bg-gray-50 text-gray-500' : 'bg-gray-100 focus:bg-white'
      }`}
    />
  </div>
);

export default Input;