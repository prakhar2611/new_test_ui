"use client";

import { createContext, useContext, useState, useCallback } from 'react';

// Context for toast notifications
const ToastContext = createContext(null);

// Types of toasts
const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // Add a new toast
  const toast = useCallback(({ title, description, status = 'info', duration = 3000, isClosable = true }) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    const newToast = {
      id,
      title,
      description,
      status,
      isClosable,
    };
    
    setToasts((prevToasts) => [...prevToasts, newToast]);
    
    // Auto-dismiss toast after duration
    if (duration) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  }, []);
  
  // Remove a toast by ID
  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);
  
  // Get the appropriate style for a toast based on its status
  const getToastStyles = (status) => {
    const baseStyles = "fixed flex flex-col items-start p-4 rounded-md shadow-lg";
    
    switch (status) {
      case TOAST_TYPES.SUCCESS:
        return `${baseStyles} bg-green-50 border-l-4 border-green-500 text-green-800`;
      case TOAST_TYPES.ERROR:
        return `${baseStyles} bg-red-50 border-l-4 border-red-500 text-red-800`;
      case TOAST_TYPES.WARNING:
        return `${baseStyles} bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800`;
      case TOAST_TYPES.INFO:
      default:
        return `${baseStyles} bg-blue-50 border-l-4 border-blue-500 text-blue-800`;
    }
  };
  
  // Get the icon for a toast based on its status
  const getToastIcon = (status) => {
    switch (status) {
      case TOAST_TYPES.SUCCESS:
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        );
      case TOAST_TYPES.ERROR:
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case TOAST_TYPES.WARNING:
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case TOAST_TYPES.INFO:
      default:
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };
  
  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      
      {/* Toast container */}
      <div className="fixed bottom-0 right-0 p-4 z-50 space-y-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={getToastStyles(toast.status)}
            role="alert"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-2">
                {getToastIcon(toast.status)}
              </div>
              <div>
                {toast.title && <div className="font-semibold">{toast.title}</div>}
                {toast.description && <div className="text-sm">{toast.description}</div>}
              </div>
              
              {toast.isClosable && (
                <button
                  onClick={() => removeToast(toast.id)}
                  className="ml-4 text-gray-400 hover:text-gray-600"
                  aria-label="Close"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Hook to use toast notifications
export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (context === null) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
}; 