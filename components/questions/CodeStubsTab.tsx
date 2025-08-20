import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import AddCodeStubModal from './AddCodeStubModal';
import axios from 'axios';

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

interface CodeStubsTabProps {
  questionId: string;
  onSave: (data: any) => Promise<void>;
  onDataChange: () => void;
}

export const CodeStubsTab: React.FC<CodeStubsTabProps> = ({
  questionId,
  onSave,
  onDataChange,
}) => {
  const [driverCodes, setDriverCodes] = useState<DriverCode[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCode, setEditingCode] = useState<DriverCode | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // fetchDriverCodes();
    fetchLanguages();
  }, [questionId]);

  const fetchDriverCodes = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/problems/driver-code/${questionId}`);
      setDriverCodes(response.data);
    } catch (error) {
      console.error('Error fetching driver codes:', error);
    }
  };

  const fetchLanguages = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/languages`);
      setLanguages(response.data.data.languages);
    } catch (error) {
      console.error('Error fetching languages:', error);
    }
  };

  const handleAddDriverCode = () => {
    setEditingCode(null);
    setShowAddModal(true);
  };

  const handleEditDriverCode = (driverCode: DriverCode) => {
    setEditingCode(driverCode);
    setShowAddModal(true);
  };

  const handleDeleteDriverCode = async (driverCodeId: string) => {
    if (!confirm('Are you sure you want to delete this driver code?')) return;

    try {
      const response = await fetch(`/api/problems/driver-code/${questionId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverCodeId }),
      });

      if (response.ok) {
        setDriverCodes(prev => prev.filter(dc => dc.id !== driverCodeId));
        onDataChange();
      }
    } catch (error) {
      console.error('Error deleting driver code:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave({ driverCodes });
    } finally {
      setIsLoading(false);
    }
  };

  const availableLanguages = languages.filter(
    lang => !driverCodes.some(dc => dc.languageId === lang.id)
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Code Stubs</h3>
          <p className="text-sm text-gray-500">
            Define language-specific code templates including prelude code, boilerplate code, and driver code for different programming languages.
          </p>
        </div>
        <Button 
          onClick={handleAddDriverCode}
          disabled={availableLanguages.length === 0}
          className="bg-green-600 hover:bg-green-700"
        >
          + Add Code Stub
        </Button>
      </div>

      {driverCodes.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6 inline-block">
            <p className="text-blue-800 text-sm">
              💡 Add code stubs to provide language-specific templates for users
            </p>
          </div>
          <p className="text-gray-500">No code stubs have been added yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {driverCodes.map(driverCode => (
            <div key={driverCode.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">
                    {driverCode.languageName}
                  </h4>
                  <p className="text-sm text-gray-500">Language ID: {driverCode.languageId}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditDriverCode(driverCode)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteDriverCode(driverCode.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prelude Code
                  </label>
                  <textarea
                    value={driverCode.prelude}
                    readOnly
                    rows={4}
                    className="w-full p-2 text-sm font-mono bg-gray-50 border border-gray-200 rounded-md"
                    placeholder="No prelude code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Boilerplate Code
                  </label>
                  <textarea
                    value={driverCode.boilerplate}
                    readOnly
                    rows={4}
                    className="w-full p-2 text-sm font-mono bg-gray-50 border border-gray-200 rounded-md"
                    placeholder="No boilerplate code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Driver Code
                  </label>
                  <textarea
                    value={driverCode.driverCode}
                    readOnly
                    rows={4}
                    className="w-full p-2 text-sm font-mono bg-gray-50 border border-gray-200 rounded-md"
                    placeholder="No driver code"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {showAddModal && (
        <AddCodeStubModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          languages={availableLanguages}
          editingCode={editingCode}
          questionId={questionId}
          onSave={(newDriverCode) => {
            if (editingCode) {
              setDriverCodes(prev => prev.map(dc => dc.id === editingCode.id ? newDriverCode : dc));
            } else {
              setDriverCodes(prev => [...prev, newDriverCode]);
            }
            onDataChange();
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
};

export default CodeStubsTab;