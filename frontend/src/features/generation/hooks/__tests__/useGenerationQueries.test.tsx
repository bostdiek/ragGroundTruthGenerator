import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  mockDocuments,
  mockGenerationResponse,
} from '../../../../testing/mocks/generation-handlers';
import { queryClient } from '../../../../testing/setup';
import { useGenerateAnswer, useRules } from '../useGenerationQueries';

// Helper to wrap components with providers
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useGenerationQueries', () => {
  describe('useGenerateAnswer', () => {
    it('should generate an answer successfully', async () => {
      // Setup the request data
      const requestData = {
        question: 'Test question?',
        documents: mockDocuments,
      };

      // Render the hook with our test wrapper
      const { result } = renderHook(() => useGenerateAnswer(), { wrapper });

      // Call the mutate function from the hook
      result.current.mutate(requestData);

      // Wait for the mutation to complete
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Verify the response data
      expect(result.current.data).toEqual(mockGenerationResponse);
    });

    it('should handle errors properly', async () => {
      // Setup the request data
      const requestData = {
        question: '', // Empty question to trigger an error
        documents: [],
      };

      // Render the hook with our test wrapper
      const { result } = renderHook(() => useGenerateAnswer(), { wrapper });

      // Call the mutate function from the hook
      result.current.mutate(requestData);

      // Wait for the mutation to complete with an error
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useRules', () => {
    it('should fetch rules successfully', async () => {
      // Render the hook with our test wrapper
      const { result } = renderHook(() => useRules(), { wrapper });

      // Wait for the query to complete
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Verify the response data
      expect(result.current.data).toHaveLength(2);
      expect(result.current.data?.[0]).toHaveProperty('id', 'rule-1');
    });
  });
});
