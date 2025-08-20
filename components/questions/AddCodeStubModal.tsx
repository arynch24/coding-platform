import { useState } from "react";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";

interface DriverCode {
  id: string;
  languageId: string;
  languageName: string;
  prelude: string;
  boilerplate: string;
  driverCode: string;
}

interface Language {
  id: string;
  name: string;
}

const AddCodeStubModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  languages: Language[];
  editingCode: DriverCode | null;
  questionId: string;
  onSave: (driverCode: DriverCode) => void;
}> = ({ isOpen, onClose, languages, editingCode, questionId, onSave }) => {
  const [formData, setFormData] = useState({
    languageId: editingCode?.languageId || '',
    prelude: editingCode?.prelude || '',
    boilerplate: editingCode?.boilerplate || '',
    driverCode: editingCode?.driverCode || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.languageId) return;

    setIsLoading(true);
    try {
      const url = editingCode 
        ? `/api/problems/driver-code/${questionId}`
        : `/api/problems/driver-code/${questionId}`;
      
      const method = editingCode ? 'PATCH' : 'POST';
      const body = editingCode 
        ? { ...formData, driverCodeId: editingCode.id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        const selectedLanguage = languages.find(lang => lang.id === formData.languageId);
        
        const newDriverCode: DriverCode = {
          id: editingCode?.id || data.id,
          languageId: formData.languageId,
          languageName: selectedLanguage?.name || '',
          prelude: formData.prelude,
          boilerplate: formData.boilerplate,
          driverCode: formData.driverCode,
        };
        
        onSave(newDriverCode);
      }
    } catch (error) {
      console.error('Error saving driver code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">
            {editingCode ? 'Edit Code Stub' : 'Add Code Stub'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Programming Language *
            </label>
            <Select
              value={formData.languageId}
              onChange={(value) => setFormData(prev => ({ ...prev, languageId: value }))}
              options={languages.map(lang => ({ 
                value: lang.id, 
                label: `${lang.name}` 
              }))}
              placeholder="Select a language..."
            //   disabled={!!editingCode}
            />
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prelude Code
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Code that runs before the user's solution (imports, helper functions, etc.)
              </p>
              <textarea
                value={formData.prelude}
                onChange={(e) => setFormData(prev => ({ ...prev, prelude: e.target.value }))}
                rows={6}
                className="w-full p-3 text-sm font-mono border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                placeholder="// Add your prelude code here..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Boilerplate Code
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Template code that users will see and can modify (function signatures, etc.)
              </p>
              <textarea
                value={formData.boilerplate}
                onChange={(e) => setFormData(prev => ({ ...prev, boilerplate: e.target.value }))}
                rows={8}
                className="w-full p-3 text-sm font-mono border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                placeholder="// Add your boilerplate code here..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Driver Code
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Code that calls the user's function and handles input/output
              </p>
              <textarea
                value={formData.driverCode}
                onChange={(e) => setFormData(prev => ({ ...prev, driverCode: e.target.value }))}
                rows={8}
                className="w-full p-3 text-sm font-mono border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                placeholder="// Add your driver code here..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.languageId || isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Saving...' : (editingCode ? 'Update' : 'Add Code Stub')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCodeStubModal;