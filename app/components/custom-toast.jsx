"use client"

import { useEffect } from 'react'
import { toast as sonnerToast } from 'sonner'
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react'

export const toast = {
  success: (message) => {
    sonnerToast.custom((t) => (
      <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-green-100 dark:border-green-900">
        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
        <div className="flex-1">{message}</div>
        <button onClick={() => sonnerToast.dismiss(t)} className="text-gray-400 hover:text-gray-500">
          <X className="h-4 w-4" />
        </button>
      </div>
    ), { duration: 4000 })
  },
  
  error: (message) => {
    sonnerToast.custom((t) => (
      <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-red-100 dark:border-red-900">
        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
        <div className="flex-1">{message}</div>
        <button onClick={() => sonnerToast.dismiss(t)} className="text-gray-400 hover:text-gray-500">
          <X className="h-4 w-4" />
        </button>
      </div>
    ), { duration: 5000 })
  },
  
  info: (message) => {
    sonnerToast.custom((t) => (
      <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-blue-100 dark:border-blue-900">
        <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
        <div className="flex-1">{message}</div>
        <button onClick={() => sonnerToast.dismiss(t)} className="text-gray-400 hover:text-gray-500">
          <X className="h-4 w-4" />
        </button>
      </div>
    ), { duration: 4000 })
  }
}

// ToastProvider component to be used at the app level
export function ToastProvider() {
  useEffect(() => {
    // Configure global toast settings
    sonnerToast.custom = sonnerToast.custom || sonnerToast;
  }, []);
  
  return null;
} 