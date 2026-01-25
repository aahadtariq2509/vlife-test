import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const Toast = ({ 
  type = 'info', 
  title, 
  message, 
  duration = 5000, 
  onClose, 
  className,
  show = true 
}) => {
  const [isVisible, setIsVisible] = useState(show);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleClose = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsLeaving(false);
    }
  }, [show]);

  useEffect(() => {
    if (duration > 0 && isVisible) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, isVisible, handleClose]);

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const variants = {
    success: {
      container: 'bg-green-50 border-l-4 border-l-green-500 border-green-200 dark:bg-green-900/20 dark:border-green-800',
      icon: 'text-green-500 dark:text-green-400',
      title: 'text-green-800 dark:text-green-200',
      message: 'text-green-700 dark:text-green-300',
      closeButton: 'text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-200',
    },
    error: {
      container: 'bg-red-50 border-l-4 border-l-red-500 border-red-200 dark:bg-red-900/20 dark:border-red-800',
      icon: 'text-red-500 dark:text-red-400',
      title: 'text-red-800 dark:text-red-200',
      message: 'text-red-700 dark:text-red-300',
      closeButton: 'text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200',
    },
    warning: {
      container: 'bg-yellow-50 border-l-4 border-l-yellow-500 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
      icon: 'text-yellow-500 dark:text-yellow-400',
      title: 'text-yellow-800 dark:text-yellow-200',
      message: 'text-yellow-700 dark:text-yellow-300',
      closeButton: 'text-yellow-500 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-200',
    },
    info: {
      container: 'bg-blue-50 border-l-4 border-l-blue-500 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
      icon: 'text-blue-500 dark:text-blue-400',
      title: 'text-blue-800 dark:text-blue-200',
      message: 'text-blue-700 dark:text-blue-300',
      closeButton: 'text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200',
    },
  };

  const Icon = icons[type];
  const variant = variants[type];

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-xl border p-5 transition-all duration-300 ease-in-out transform',
        variant.container,
        isLeaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100',
        className
      )}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={cn('w-5 h-5', variant.icon)} />
        </div>
        <div className="ml-3 w-0 flex-1">
          {title && (
            <p className={cn('text-sm font-medium', variant.title)}>
              {title}
            </p>
          )}
          {message && (
            <p className={cn('mt-1 text-sm', variant.message)}>
              {message}
            </p>
          )}
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            className={cn(
              'rounded-md inline-flex focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
              variant.closeButton
            )}
            onClick={handleClose}
          >
            <span className="sr-only">Close</span>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Toast Container Component
export const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          onClose={() => onRemove(toast.id)}
          show={toast.show}
        />
      ))}
    </div>
  );
};

// Lightweight toast hook with automatic cleanup
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = {
      id,
      type: 'info',
      duration: 3000, // Reduced from 5000ms
      show: true,
      ...toast,
    };
    
    setToasts(prev => [...prev, newToast]);
    
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (title, message, duration = 3000) => 
    addToast({ type: 'success', title, message, duration });
  
  const error = (title, message, duration = 5000) => 
    addToast({ type: 'error', title, message, duration });
  
  const warning = (title, message, duration = 4000) => 
    addToast({ type: 'warning', title, message, duration });
  
  const info = (title, message, duration = 3000) => 
    addToast({ type: 'info', title, message, duration });

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
};

export default Toast;
