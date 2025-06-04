import { create } from 'zustand';

/**
 * Error state interface
 */
export interface AppError {
  id: string;
  message: string;
  code?: string;
  details?: string;
  timestamp: number;
}

interface ErrorState {
  errors: AppError[];
  // Actions
  addError: (error: Omit<AppError, 'id' | 'timestamp'>) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
}

/**
 * Error store
 *
 * Provides global error state management using Zustand
 */
export const useErrorStore = create<ErrorState>()(set => ({
  errors: [],

  // Add a new error
  addError: error =>
    set(state => ({
      errors: [
        ...state.errors,
        {
          ...error,
          id: Math.random().toString(36).substring(2, 9), // Simple ID generation
          timestamp: Date.now(),
        },
      ],
    })),

  // Remove an error by ID
  removeError: id =>
    set(state => ({
      errors: state.errors.filter(error => error.id !== id),
    })),

  // Clear all errors
  clearErrors: () => set({ errors: [] }),
}));
