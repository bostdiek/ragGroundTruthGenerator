import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Creates a fresh QueryClient for testing purposes
 */
export const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0, // gcTime replaces cacheTime in React Query v5
      staleTime: 0,
      refetchOnWindowFocus: false,
    },
  }
});

/**
 * A wrapper component that provides a QueryClient for testing
 */
export const TestQueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
