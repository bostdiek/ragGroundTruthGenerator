import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import QAPairsService from '../../features/qa_pairs/api/qa-pairs.service';
import {
  useCreateQAPair,
  useDeleteQAPair,
  useQAPair,
  useQAPairs,
  useUpdateQAPair,
  useUpdateQAPairStatus,
  useUpdateQAPairStatusWithComments,
} from '../../features/qa_pairs/hooks/useQAPairs';
import { TestQueryProvider } from '../../testing/utils/test-utils';

// Mock the QA pairs service
vi.mock('../../features/qa_pairs/api/qa-pairs.service', () => {
  return {
    default: {
      getQAPairs: vi.fn(),
      getQAPair: vi.fn(),
      createQAPair: vi.fn(),
      updateQAPair: vi.fn(),
      updateQAPairStatus: vi.fn(),
      updateQAPairStatusWithComments: vi.fn(),
      deleteQAPair: vi.fn(),
    },
  };
});

// Mock QA pair data
const mockQAPair = {
  id: 'qa-1',
  collection_id: 'collection-1',
  question: 'Test question?',
  answer: 'Test answer',
  documents: [],
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  created_by: 'user-1',
  status: 'ready_for_review' as const,
  metadata: {},
};

const mockQAPairs = [mockQAPair];

describe('QA Pairs Hooks', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('useQAPairs', () => {
    it('should fetch QA pairs for a collection', async () => {
      // Mock the service response
      vi.mocked(QAPairsService.getQAPairs).mockResolvedValue(mockQAPairs);

      // Render the hook
      const { result } = renderHook(() => useQAPairs('collection-1'), {
        wrapper: TestQueryProvider,
      });

      // Initial state should be loading
      expect(result.current.isLoading).toBe(true);

      // Wait for the query to complete
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Check that the service was called correctly
      expect(QAPairsService.getQAPairs).toHaveBeenCalledWith('collection-1');

      // Check that the data is correct
      expect(result.current.data).toEqual(mockQAPairs);
    });

    it('should not fetch if collection ID is not provided', async () => {
      // Render the hook with no collection ID
      const { result } = renderHook(() => useQAPairs(''), {
        wrapper: TestQueryProvider,
      });

      // Query should be disabled and not loading
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isFetching).toBe(false);

      // Service should not have been called
      expect(QAPairsService.getQAPairs).not.toHaveBeenCalled();
    });
  });

  describe('useQAPair', () => {
    it('should fetch a single QA pair by ID', async () => {
      // Mock the service response
      vi.mocked(QAPairsService.getQAPair).mockResolvedValue(mockQAPair);

      // Render the hook
      const { result } = renderHook(() => useQAPair('qa-1'), {
        wrapper: TestQueryProvider,
      });

      // Initial state should be loading
      expect(result.current.isLoading).toBe(true);

      // Wait for the query to complete
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Check that the service was called correctly
      expect(QAPairsService.getQAPair).toHaveBeenCalledWith('qa-1');

      // Check that the data is correct
      expect(result.current.data).toEqual(mockQAPair);
    });

    it('should not fetch if ID is not provided', async () => {
      // Render the hook with no ID
      const { result } = renderHook(() => useQAPair(''), {
        wrapper: TestQueryProvider,
      });

      // Query should be disabled and not loading
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isFetching).toBe(false);

      // Service should not have been called
      expect(mockedQAPairsService.getQAPair).not.toHaveBeenCalled();
    });
  });

  describe('useCreateQAPair', () => {
    it('should create a QA pair', async () => {
      // Mock the service response
      mockedQAPairsService.createQAPair.mockResolvedValue(mockQAPair);

      // Render the hook
      const { result } = renderHook(() => useCreateQAPair('collection-1'), {
        wrapper: TestQueryProvider,
      });

      // Create a new QA pair
      result.current.mutate({
        question: 'Test question?',
        answer: 'Test answer',
        status: 'ready_for_review' as const,
        metadata: {},
      });

      // Wait for the mutation to complete
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Check that the service was called correctly
      expect(mockedQAPairsService.createQAPair).toHaveBeenCalledWith(
        'collection-1',
        {
          question: 'Test question?',
          answer: 'Test answer',
          status: 'ready_for_review',
          metadata: {},
        }
      );

      // Check that the data is correct
      expect(result.current.data).toEqual(mockQAPair);
    });
  });

  describe('useUpdateQAPair', () => {
    it('should update a QA pair', async () => {
      // Mock the service response
      mockedQAPairsService.updateQAPair.mockResolvedValue(mockQAPair);

      // Render the hook
      const { result } = renderHook(() => useUpdateQAPair('qa-1'), {
        wrapper: TestQueryProvider,
      });

      // Update the QA pair
      result.current.mutate({
        answer: 'Updated answer',
      });

      // Wait for the mutation to complete
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Check that the service was called correctly
      expect(mockedQAPairsService.updateQAPair).toHaveBeenCalledWith('qa-1', {
        answer: 'Updated answer',
      });

      // Check that the data is correct
      expect(result.current.data).toEqual(mockQAPair);
    });
  });

  describe('useUpdateQAPairStatus', () => {
    it('should update a QA pair status', async () => {
      // Mock the service response
      mockedQAPairsService.updateQAPairStatus.mockResolvedValue({
        ...mockQAPair,
        status: 'approved' as const,
      });

      // Render the hook
      const { result } = renderHook(() => useUpdateQAPairStatus('qa-1'), {
        wrapper: TestQueryProvider,
      });

      // Update the QA pair status
      result.current.mutate('approved');

      // Wait for the mutation to complete
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Check that the service was called correctly
      expect(mockedQAPairsService.updateQAPairStatus).toHaveBeenCalledWith(
        'qa-1',
        'approved'
      );

      // Check that the data is correct
      expect(result.current.data).toEqual({
        ...mockQAPair,
        status: 'approved',
      });
    });
  });

  describe('useUpdateQAPairStatusWithComments', () => {
    it('should update a QA pair status with revision comments', async () => {
      // Mock the getQAPair service response (for getting current metadata)
      mockedQAPairsService.getQAPair.mockResolvedValue(mockQAPair);

      // Mock the updateQAPairStatusWithComments service response
      const updatedQAPair = {
        ...mockQAPair,
        status: 'revision_requested' as const,
        metadata: {
          revision_comments: 'Please fix this answer',
        },
      };
      mockedQAPairsService.updateQAPairStatusWithComments.mockResolvedValue(
        updatedQAPair
      );

      // Render the hook
      const { result } = renderHook(
        () => useUpdateQAPairStatusWithComments('qa-1'),
        {
          wrapper: TestQueryProvider,
        }
      );

      // Update the QA pair status with comments
      result.current.mutate({
        status: 'revision_requested',
        revisionComments: 'Please fix this answer',
      });

      // Wait for the mutation to complete
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Check that the service was called correctly
      expect(
        mockedQAPairsService.updateQAPairStatusWithComments
      ).toHaveBeenCalledWith(
        'qa-1',
        'revision_requested',
        'Please fix this answer'
      );

      // Check that the data is correct
      expect(result.current.data).toEqual(updatedQAPair);
    });
  });

  describe('useDeleteQAPair', () => {
    it('should delete a QA pair', async () => {
      // Mock the service response
      mockedQAPairsService.deleteQAPair.mockResolvedValue(undefined);

      // Render the hook
      const { result } = renderHook(() => useDeleteQAPair('collection-1'), {
        wrapper: TestQueryProvider,
      });

      // Delete the QA pair
      result.current.mutate('qa-1');

      // Wait for the mutation to complete
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Check that the service was called correctly
      expect(mockedQAPairsService.deleteQAPair).toHaveBeenCalledWith('qa-1');
    });
  });
});
