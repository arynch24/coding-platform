import React, { useState } from 'react';
import { ActionData } from '@/types/dashboard';


export const Modal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
                >
                    ×
                </button>
                {children}
            </div>
        </div>
    );
};

// Actions Modal Content
export const ActionsModal = ({ 
    studentName, 
    onSave, 
    onClose 
}: { 
    studentName: string; 
    onSave: (data: ActionData) => void; 
    onClose: () => void 
}) => {
    const [actionType, setActionType] = useState('warning');
    const [reason, setReason] = useState('');
    const [notes, setNotes] = useState('');

    const handleSave = () => {
        onSave({ type: actionType, reason, notes });
        onClose();
    };

    return (
        <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Action for {studentName}</h3>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Action Type
                    </label>
                    <select
                        value={actionType}
                        onChange={(e) => setActionType(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                        <option value="warning">Warning</option>
                        <option value="suspension">Suspension</option>
                        <option value="investigation">Investigation</option>
                    </select>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason
                    </label>
                    <input
                        type="text"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Enter reason..."
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Notes
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Optional notes..."
                        rows={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Save Action
                </button>
            </div>
        </div>
    );
};

export const ActionButton = ({ onClick }: { onClick: () => void }) => (
    <button
        onClick={onClick}
        className="bg-black text-white px-2 py-1 rounded text-xs font-bold hover:bg-gray-800 transition-colors"
    >
        !
    </button>
);