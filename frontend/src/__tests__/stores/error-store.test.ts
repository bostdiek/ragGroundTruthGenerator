import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useErrorStore } from '../../stores/error-store';

describe('Error Store', () => {
  // Reset the store before each test
  beforeEach(() => {
    useErrorStore.setState({ errors: [] });
    vi.clearAllMocks();
  });

  it('should initialize with empty errors array', () => {
    const state = useErrorStore.getState();
    expect(state.errors).toEqual([]);
  });

  it('should add an error to the store', () => {
    // Mock Date.now to return a fixed timestamp
    const mockDate = 1654321098765;
    vi.spyOn(Date, 'now').mockImplementation(() => mockDate);
    
    // Mock Math.random to return a fixed value for the ID
    const mockRandom = 0.123456789;
    vi.spyOn(Math, 'random').mockImplementation(() => mockRandom);
    
    const errorToAdd = {
      message: 'Test error message',
      code: 'TEST_ERROR',
      details: 'Test error details',
    };
    
    useErrorStore.getState().addError(errorToAdd);
    
    const state = useErrorStore.getState();
    expect(state.errors.length).toBe(1);
    
    const expectedError = {
      ...errorToAdd,
      id: expect.any(String),
      timestamp: mockDate,
    };
    
    expect(state.errors[0]).toMatchObject(expectedError);
    
    // Restore mocks
    vi.restoreAllMocks();
  });

  it('should remove an error by ID', () => {
    // Add two errors
    useErrorStore.getState().addError({ message: 'Error 1' });
    useErrorStore.getState().addError({ message: 'Error 2' });
    
    const state = useErrorStore.getState();
    expect(state.errors.length).toBe(2);
    
    // Remove the first error
    const errorId = state.errors[0].id;
    useErrorStore.getState().removeError(errorId);
    
    const updatedState = useErrorStore.getState();
    expect(updatedState.errors.length).toBe(1);
    expect(updatedState.errors[0].message).toBe('Error 2');
  });

  it('should clear all errors', () => {
    // Add some errors
    useErrorStore.getState().addError({ message: 'Error 1' });
    useErrorStore.getState().addError({ message: 'Error 2' });
    
    // Verify errors were added
    expect(useErrorStore.getState().errors.length).toBe(2);
    
    // Clear all errors
    useErrorStore.getState().clearErrors();
    
    // Verify errors were cleared
    expect(useErrorStore.getState().errors.length).toBe(0);
  });
});
