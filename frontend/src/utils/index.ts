/**
 * AI Ground Truth Generator - Utilities
 * 
 * This file contains utility functions and custom hooks used throughout the application.
 * Add your own utilities here as needed.
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Truncates a string to a specified length and adds an ellipsis if needed.
 * 
 * @param str - The string to truncate
 * @param length - Maximum length (default: 100)
 * @returns Truncated string
 */
export const truncateString = (str: string, length = 100): string => {
  if (!str) return '';
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
};

/**
 * Formats a date string into a human-readable format.
 * 
 * @param dateString - ISO date string
 * @param format - Format to use (default: 'MMM D, YYYY')
 * @returns Formatted date string
 */
export const formatDate = (dateString: string, format = 'MMM D, YYYY'): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Simple format implementation - replace with date-fns or similar in production
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return format
    .replace('MMM', monthNames[date.getMonth()])
    .replace('D', date.getDate().toString())
    .replace('YYYY', date.getFullYear().toString());
};

/**
 * Generates a random ID string.
 * 
 * @param length - Length of the ID (default: 8)
 * @returns Random ID string
 */
export const generateId = (length = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

/**
 * Custom hook for debouncing values (e.g., search inputs).
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300)
 * @returns Debounced value
 */
export const useDebounce = <T>(value: T, delay = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Custom hook for handling form state.
 * 
 * @param initialValues - Initial form values
 * @returns Form state and handlers
 */
export const useForm = <T extends Record<string, any>>(initialValues: T) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setValues,
    setErrors,
    reset,
  };
};

/**
 * Custom hook for local storage.
 * 
 * @param key - Storage key
 * @param initialValue - Initial value
 * @returns Stored value and setter
 */
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage', error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error writing to localStorage', error);
    }
  };

  return [storedValue, setValue] as const;
};

/**
 * Custom hook for managing pagination.
 * 
 * @param totalItems - Total number of items
 * @param initialPage - Initial page (default: 1)
 * @param initialPageSize - Initial page size (default: 10)
 * @returns Pagination state and handlers
 */
export const usePagination = (totalItems: number, initialPage = 1, initialPageSize = 10) => {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = Math.ceil(totalItems / pageSize);

  const nextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const changePageSize = (newPageSize: number) => {
    setPageSize(newPageSize);
    // Adjust current page if needed to ensure we don't go out of bounds with the new page size
    const newTotalPages = Math.ceil(totalItems / newPageSize);
    if (page > newTotalPages) {
      setPage(newTotalPages);
    }
  };

  return {
    page,
    pageSize,
    totalPages,
    nextPage,
    prevPage,
    goToPage,
    changePageSize,
  };
};
