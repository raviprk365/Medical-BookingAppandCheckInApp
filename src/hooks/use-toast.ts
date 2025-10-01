'use client';

import { useState } from 'react';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 15);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after duration
    setTimeout(() => {
      removeToast(id);
    }, toast.duration || 5000);
    
    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const toast = {
    success: (title: string, description?: string) => 
      addToast({ title, description, variant: 'default' }),
    error: (title: string, description?: string) => 
      addToast({ title, description, variant: 'destructive' }),
    info: (title: string, description?: string) => 
      addToast({ title, description, variant: 'default' }),
  };

  return {
    toasts,
    toast,
    removeToast,
  };
};

export default useToast;
