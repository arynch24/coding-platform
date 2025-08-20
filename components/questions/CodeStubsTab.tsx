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
}

export const CodeStubsTab: React.FC<CodeStubsTabProps> = ({
  questionId,
}) => {
  const [driverCodes, setDriverCodes] = useState<DriverCode[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCode, setEditingCode] = useState<DriverCode | null>(null);

  useEffect(() => {
    fetchDriverCodes();
    fetchLanguages();
  }, [questionId]);

  const fetchDriverCodes = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/problems/driver-code/${questionId}`, {
        withCredentials: true,
      });

      // Handle both single object and array responses
      const codes = response.data.data;

      // Map the response to match our interface
      const mappedCodes = codes
        .map((code: any) => ({
          id: code.id,
          languageId: code.language.id || '',
          languageName: code.language.name || '',
          prelude: code.prelude || '',
          boilerplate: code.boilerplate || '',
          driverCode: code.driverCode || '',
        }));

      setDriverCodes(mappedCodes);
    } catch (error) {
      console.error('Error fetching driver codes:', error);
      setDriverCodes([]);
    }
  };

  const fetchLanguages = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/languages`, {
        withCredentials: true,
      });
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
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/problems/driver-code/${questionId}?id=${driverCodeId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        setDriverCodes(prev => prev.filter(dc => dc.id !== driverCodeId));
      } else {
        console.error('Error deleting driver code:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting driver code:', error);
    }
  };

  const handleSaveDriverCode = (newDriverCode: DriverCode) => {
    if (editingCode) {
      // Update existing driver code
      setDriverCodes(prev => prev.map(dc => dc.id === editingCode.id ? newDriverCode : dc));
    } else {
      // Add new driver code
      setDriverCodes(prev => [...prev, newDriverCode]);
    }
    setShowAddModal(false);
  };

  // Get available languages (excluding those that already have driver codes)
  const availableLanguages = editingCode
    ? languages // When editing, show all languages but disable the select
    : languages.filter(lang => !driverCodes.some(dc => dc.languageId === lang.id));

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
                    Language: {driverCode.languageName}
                  </h4>
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

      {showAddModal && (
        <AddCodeStubModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          languages={availableLanguages}
          editingCode={editingCode}
          questionId={questionId}
          onSave={handleSaveDriverCode}
        />
      )}
    </div>
  );
};

export default CodeStubsTab;