import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { TestCase } from '@/types/dashboard';
import { toast } from "sonner";

interface FileUploadProps {
  onUpload: (testCases: TestCase[]) => void;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload, disabled = false }) => {
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file.type === 'application/json' || file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsedTestCases = JSON.parse(content) as TestCase[];
          onUpload(parsedTestCases);
        } catch (error) {
          toast.error('Error parsing JSON file. Please check the format.');
        }
      };
      reader.readAsText(file);
    } else {
      toast.info('Please upload a JSON file with test cases.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}`}
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
    >
      <Upload className="mx-auto mb-2 text-gray-400" size={24} />
      <p className="text-gray-600 mb-2">Drop your test cases JSON file here or</p>
      <label className={`inline-flex items-center gap-2 px-4 py-2 bg-qc-dark text-white rounded-md transition-colors ${
        disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-qc-dark/90 cursor-pointer'
      }`}>
        <Upload size={16} />
        Browse Files
        <input
          type="file"
          accept=".json"
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />
      </label>
      <p className="text-xs text-gray-500 mt-2">
        Expected format: JSON array with test case objects
      </p>
    </div>
  );
};

export default FileUpload;