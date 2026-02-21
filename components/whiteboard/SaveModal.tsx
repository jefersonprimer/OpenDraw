'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { saveToFile, generateDefaultFileName } from '@/lib/fileService';
import { WhiteboardElement } from '@/lib/db';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  elements: WhiteboardElement[];
}

export function SaveModal({ isOpen, onClose, elements }: SaveModalProps) {
  const [filename, setFilename] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFilename(generateDefaultFileName());
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!filename.trim()) {
      alert('Please enter a file name');
      return;
    }

    setIsSaving(true);
    try {
      await saveToFile(elements, filename.trim());
      onClose();
    } catch (error) {
      alert(`Failed to save file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 border border-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-[#1b1b1f]">Save to disk</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-neutral-100 text-neutral-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-neutral-600">
            Export the scene data to a file from which you can import later.
          </p>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#1b1b1f]">
              File name:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 px-3 py-2 border border-neutral-300 rounded-md text-sm text-[#1b1b1f] outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                placeholder="Enter file name"
                autoFocus
              />
              <span className="text-sm text-neutral-500">.pwb</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-neutral-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !filename.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save to file'}
          </button>
        </div>
      </div>
    </div>
  );
}
