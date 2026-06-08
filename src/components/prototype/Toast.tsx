'use client';

import React from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  visible: boolean;
  onDismiss: () => void;
}

export function Toast({ message, visible, onDismiss }: ToastProps) {
  if (!visible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl shadow-lg border border-gray-200">
        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
        <span className="text-sm text-gray-700">{message}</span>
        <button
          onClick={onDismiss}
          className="p-1 text-gray-400 hover:text-gray-600 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
