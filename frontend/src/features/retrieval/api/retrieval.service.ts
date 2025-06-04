import { apiClient, createApiError } from '../../../lib/api/client';
import {
  Document,
  PaginatedResponse,
  SearchParams,
  SearchResult,
  Source,
} from '../types/index';

/**
 * Service for document retrieval API calls
 */
const RetrievalService = {
  /**
   * Get available data sources with optional pagination
   * @param page - Page number (1-indexed)
   * @param limit - Number of sources per page
   * @returns Promise with array of sources and pagination metadata
   */
  getSources: async (
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<Source>> => {
    try {
      const response = await apiClient.get<PaginatedResponse<Source>>(
        '/retrieval/data_sources',
        {
          params: {
            page,
            limit,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw createApiError(error);
    }
  },

  /**
   * Search for documents with pagination, filtering, and sorting
   * @param searchParams - Search parameters including pagination, filters, and sorting
   * @returns Promise with search results and pagination metadata
   */
  searchDocuments: async (
    searchParams: SearchParams
  ): Promise<SearchResult> => {
    try {
      const { query, filters, limit = 10 } = searchParams;

      // Extract source IDs from filters if present
      const sources = filters?.sourceIds || [];

      const response = await apiClient.post<SearchResult>('/retrieval/search', {
        query,
        sources,
        max_results: limit,
      });

      return response.data;
    } catch (error: any) {
      throw createApiError(error);
    }
  },

  /**
   * Get a document by ID
   * @param id - Document ID
   * @returns Promise with document details
   */
  getDocument: async (id: string): Promise<Document> => {
    try {
      const response = await apiClient.get<Document>(
        `/retrieval/documents/${id}`
      );
      return response.data;
    } catch (error: any) {
      throw createApiError(error);
    }
  },

  /**
   * Get recommended documents based on a question with pagination, filtering, and sorting
   * @param question - The question text
   * @param searchParams - Additional search parameters (sources, filters, pagination, sorting)
   * @returns Promise with search results and pagination metadata
   */
  getRecommendedDocuments: async (
    question: string,
    searchParams: Omit<SearchParams, 'query'> = {}
  ): Promise<SearchResult> => {
    try {
      const { filters, limit = 10 } = searchParams;

      // Extract source IDs from filters if present
      const sources = filters?.sourceIds || [];

      const response = await apiClient.post<SearchResult>('/retrieval/search', {
        query: question,
        sources,
        max_results: limit,
      });

      return response.data;
    } catch (error: any) {
      throw createApiError(error);
    }
  },

  /**
   * Get document suggestions based on partial input
   * @param partialInput - Partial text input for suggestion
   * @param sources - Optional array of source IDs to filter by
   * @param limit - Optional maximum number of results to return
   * @returns Promise with array of document suggestions
   */
  getDocumentSuggestions: async (
    partialInput: string,
    sources?: string[],
    limit?: number
  ): Promise<Document[]> => {
    try {
      const response = await apiClient.get<Document[]>(
        '/retrieval/suggestions',
        {
          params: {
            query: partialInput,
            sources: sources?.join(','),
            limit: limit || 5,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw createApiError(error);
    }
  },
};

export default RetrievalService;
