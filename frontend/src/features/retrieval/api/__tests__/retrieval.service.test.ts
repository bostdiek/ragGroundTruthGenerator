import { describe, expect, it, vi } from 'vitest';

import { apiClient } from '../../../../lib/api/client';
import RetrievalService from '../retrieval.service';

// Mock the API client
vi.mock('../../../../lib/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('RetrievalService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getSources', () => {
    it('fetches data sources successfully', async () => {
      // Mock API response
      const mockSources = {
        items: [
          {
            id: 'source1',
            name: 'Test Source 1',
            type: 'memory',
            description: 'Test source 1',
          },
          {
            id: 'source2',
            name: 'Test Source 2',
            type: 'file',
            description: 'Test source 2',
          },
        ],
        totalCount: 2,
        page: 1,
        totalPages: 1,
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockSources });

      // Call the service
      const result = await RetrievalService.getSources();

      // Verify API was called correctly
      expect(apiClient.get).toHaveBeenCalledWith('/retrieval/data_sources', {
        params: {
          page: 1,
          limit: 20,
        },
      });

      // Verify result
      expect(result).toEqual(mockSources);
    });

    it('handles errors when fetching data sources', async () => {
      // Mock API error
      const mockError = new Error('API error');
      vi.mocked(apiClient.get).mockRejectedValueOnce(mockError);

      // Call the service and expect it to throw
      await expect(RetrievalService.getSources()).rejects.toThrow();
    });
  });

  describe('searchDocuments', () => {
    it('searches documents successfully', async () => {
      // Mock search params
      const searchParams = {
        query: 'test query',
        filters: { sourceIds: ['source1'] },
        limit: 10,
      };

      // Mock API response
      const mockSearchResult = {
        documents: [
          {
            id: 'doc1',
            title: 'Test Document 1',
            content: 'This is test document 1 content',
            source: { id: 'source1', name: 'Test Source 1', type: 'memory' },
            relevance_score: 0.9,
          },
        ],
        totalCount: 1,
        page: 1,
        totalPages: 1,
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: mockSearchResult,
      });

      // Call the service
      const result = await RetrievalService.searchDocuments(searchParams);

      // Verify API was called correctly
      expect(apiClient.post).toHaveBeenCalledWith('/retrieval/search', {
        query: 'test query',
        sources: ['source1'],
        max_results: 10,
      });

      // Verify result
      expect(result).toEqual(mockSearchResult);
    });

    it('handles empty filters', async () => {
      // Mock search params with no filters
      const searchParams = {
        query: 'test query',
        limit: 10,
      };

      // Mock API response
      const mockSearchResult = {
        documents: [],
        totalCount: 0,
        page: 1,
        totalPages: 0,
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: mockSearchResult,
      });

      // Call the service
      await RetrievalService.searchDocuments(searchParams);

      // Verify API was called with empty sources array
      expect(apiClient.post).toHaveBeenCalledWith('/retrieval/search', {
        query: 'test query',
        sources: [],
        max_results: 10,
      });
    });
  });

  describe('getRecommendedDocuments', () => {
    it('searches documents based on a question', async () => {
      // Mock search params
      const question = 'test question';
      const searchParams = {
        filters: { sourceIds: ['source1'] },
        limit: 10,
      };

      // Mock API response
      const mockSearchResult = {
        documents: [
          {
            id: 'doc1',
            title: 'Test Document 1',
            content: 'This is test document 1 content',
            source: { id: 'source1', name: 'Test Source 1', type: 'memory' },
            relevance_score: 0.9,
          },
        ],
        totalCount: 1,
        page: 1,
        totalPages: 1,
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: mockSearchResult,
      });

      // Call the service
      const result = await RetrievalService.getRecommendedDocuments(
        question,
        searchParams
      );

      // Verify API was called correctly
      expect(apiClient.post).toHaveBeenCalledWith('/retrieval/search', {
        query: question,
        sources: ['source1'],
        max_results: 10,
      });

      // Verify result
      expect(result).toEqual(mockSearchResult);
    });
  });
});
