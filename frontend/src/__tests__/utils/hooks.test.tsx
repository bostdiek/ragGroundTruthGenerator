import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  useDebounce,
  useForm,
  useLocalStorage,
  usePagination,
} from '../../utils';

describe('Custom Hooks', () => {
  describe('useDebounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it('should return the initial value immediately', () => {
      const { result } = renderHook(() => useDebounce('initial', 500));
      expect(result.current).toBe('initial');
    });

    it('should debounce value changes', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 500 } }
      );

      // Change the value
      rerender({ value: 'changed', delay: 500 });

      // Value should not have changed yet
      expect(result.current).toBe('initial');

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Now value should be updated
      expect(result.current).toBe('changed');
    });

    it('should work with different delay values', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 1000 } }
      );

      // Change the value and delay
      rerender({ value: 'changed', delay: 200 });

      // Advance time but not enough for the original delay
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Value should be updated because we used a shorter delay
      expect(result.current).toBe('changed');
    });
  });

  describe('useForm', () => {
    it('should initialize with provided values', () => {
      const initialValues = { name: 'John', email: 'john@example.com' };
      const { result } = renderHook(() => useForm(initialValues));

      expect(result.current.values).toEqual(initialValues);
    });

    it('should update values on handleChange', () => {
      const initialValues = { name: '', email: '' };
      const { result } = renderHook(() => useForm(initialValues));

      act(() => {
        result.current.handleChange({
          target: { name: 'name', value: 'John' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.values.name).toBe('John');
    });

    it('should update touched state on handleBlur', () => {
      const initialValues = { name: '', email: '' };
      const { result } = renderHook(() => useForm(initialValues));

      act(() => {
        result.current.handleBlur({
          target: { name: 'name' },
        } as React.FocusEvent<HTMLInputElement>);
      });

      expect(result.current.touched.name).toBe(true);
    });

    it('should reset form state', () => {
      const initialValues = { name: '', email: '' };
      const { result } = renderHook(() => useForm(initialValues));

      // Change values and touched state
      act(() => {
        result.current.handleChange({
          target: { name: 'name', value: 'John' },
        } as React.ChangeEvent<HTMLInputElement>);

        result.current.handleBlur({
          target: { name: 'name' },
        } as React.FocusEvent<HTMLInputElement>);

        result.current.setErrors({ name: 'Error' });
      });

      // Reset the form
      act(() => {
        result.current.reset();
      });

      // Everything should be back to initial state
      expect(result.current.values).toEqual(initialValues);
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
    });
  });

  describe('useLocalStorage', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should initialize with the provided value when localStorage is empty', () => {
      const { result } = renderHook(() =>
        useLocalStorage('testKey', 'initialValue')
      );
      expect(result.current[0]).toBe('initialValue');
    });

    it('should update localStorage when setValue is called', () => {
      const { result } = renderHook(() =>
        useLocalStorage('testKey', 'initialValue')
      );

      act(() => {
        result.current[1]('newValue');
      });

      expect(result.current[0]).toBe('newValue');
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'testKey',
        JSON.stringify('newValue')
      );
    });

    it('should allow function updates', () => {
      const { result } = renderHook(() => useLocalStorage('testKey', 10));

      act(() => {
        result.current[1](prev => prev + 5);
      });

      expect(result.current[0]).toBe(15);
    });
  });

  describe('usePagination', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => usePagination(100));

      expect(result.current.page).toBe(1);
      expect(result.current.pageSize).toBe(10);
      expect(result.current.totalPages).toBe(10);
    });

    it('should navigate to next page', () => {
      const { result } = renderHook(() => usePagination(100));

      act(() => {
        result.current.nextPage();
      });

      expect(result.current.page).toBe(2);
    });

    it('should navigate to previous page', () => {
      const { result } = renderHook(() => usePagination(100, 2));

      act(() => {
        result.current.prevPage();
      });

      expect(result.current.page).toBe(1);
    });

    it('should not go below page 1', () => {
      const { result } = renderHook(() => usePagination(100));

      act(() => {
        result.current.prevPage();
      });

      expect(result.current.page).toBe(1);
    });

    it('should not go beyond total pages', () => {
      const { result } = renderHook(() => usePagination(100, 10));

      act(() => {
        result.current.nextPage();
      });

      expect(result.current.page).toBe(10);
    });

    it('should go to a specific page', () => {
      const { result } = renderHook(() => usePagination(100));

      act(() => {
        result.current.goToPage(5);
      });

      expect(result.current.page).toBe(5);
    });

    it('should change page size and adjust current page if needed', () => {
      const { result } = renderHook(() => usePagination(100, 10, 10));

      // With 100 items and page size 10, we have 10 pages
      // Currently on page 10
      expect(result.current.page).toBe(10);

      // Change to page size 20
      act(() => {
        result.current.changePageSize(20);
      });

      // Now we should have 5 pages, and current page should be 5
      expect(result.current.totalPages).toBe(5);
      expect(result.current.page).toBe(5);
    });
  });
});
