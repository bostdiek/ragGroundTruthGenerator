import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi, beforeAll, afterAll, beforeEach } from 'vitest';
import { setupServer } from 'msw/node';
import { QueryClient } from '@tanstack/react-query';

// Import handlers
import { handlers } from './mocks/handlers';

// Set up the MSW server with specific delay settings
export const server = setupServer(...handlers);

// Create a function to get a fresh query client for tests
export const getQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: Infinity,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Create an initial query client for sharing
export let queryClient = getQueryClient();

// Start the MSW server before all tests
beforeAll(() => {
  // Use bypass to avoid logging unwanted requests
  server.listen({ 
    onUnhandledRequest: 'bypass'
  });
});

// Create a fresh query client for each test
beforeEach(() => {
  queryClient = getQueryClient();
});

// Reset handlers and cleanup after each test
afterEach(() => {
  cleanup();
  server.resetHandlers();
  queryClient.clear(); // Clear React Query cache between tests
  vi.clearAllMocks(); // Clear all mocked functions
  localStorage.clear(); // Clear localStorage between tests
});

// Close server after all tests
afterAll(() => {
  server.close();
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock console to keep test output clean
vi.spyOn(console, 'error').mockImplementation(() => {});
vi.spyOn(console, 'log').mockImplementation(() => {});
