import React from 'react';
import { ToastContainer, toast, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * Toast types
 */
export type ToastType = 'success' | 'error' | 'info' | 'warning';

/**
 * Default toast options
 */
const defaultOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

/**
 * Toast service
 * 
 * Provides methods to show toast notifications
 */
export const toastService = {
  /**
   * Show success toast
   */
  success: (message: string, options?: ToastOptions) => {
    toast.success(message, { ...defaultOptions, ...options });
  },

  /**
   * Show error toast
   */
  error: (message: string, options?: ToastOptions) => {
    toast.error(message, { ...defaultOptions, ...options });
  },

  /**
   * Show info toast
   */
  info: (message: string, options?: ToastOptions) => {
    toast.info(message, { ...defaultOptions, ...options });
  },

  /**
   * Show warning toast
   */
  warning: (message: string, options?: ToastOptions) => {
    toast.warning(message, { ...defaultOptions, ...options });
  },
};

/**
 * Toast Container component
 * 
 * Renders the toast container for the application
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
};
