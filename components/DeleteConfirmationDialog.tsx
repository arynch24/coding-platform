"use client";

import React from 'react';
import { X } from 'lucide-react';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  itemName?: string;
  confirmLabel: string;
  cancelLabel: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  itemName,
  confirmLabel,
  cancelLabel,
  isDeleting = false,
  onConfirm,
  onCancel,
}) => {
  // Don't render if not open
  if (!isOpen) return null;

  // Format message with item name
  const finalMessage = itemName ? message.replace('{item}', itemName) : message;

  // Prevent body scroll when dialog is open
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Handle click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  // Handle Escape key
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onCancel]);

  return (
    // Backdrop with click outside handling
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      {/* Dialog */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          {/* Close Button (X) */}
          <div className="p-1 bg-red-500 hover:bg-red-00 rounded-full flex items-center justify-center cursor-pointer"
            onClick={onCancel}
          >
            <X size={16} className="text-gray-100" />
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          <p className="text-gray-700 leading-relaxed">{finalMessage}</p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 pb-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {isDeleting && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationDialog;