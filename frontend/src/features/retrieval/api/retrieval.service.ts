import { apiClient } from '../../../lib/api/client';

// Types
export interface Document {
  id: string;
  title: string;
  content: string;
  source: {
    id: string;
    name: string;
    type?: string;
  };
  url?: string;
  metadata: Record<string, any>;
  relevance_score?: number;
}

export interface Source {
  id: string;
  name: string;
  description: string;
}

export interface SearchQuery {
  query: string;
  filters?: Record<string, any>;
  sources?: string[];
  limit?: number;
}

/**
 * Service for document retrieval API calls
 */
const RetrievalService = {
  /**
   * Get available data sources
   * @returns Promise with array of sources
   */
  getSources: async (): Promise<Source[]> => {
    const response = await apiClient.get<Source[]>('/retrieval/data_sources');
    return response.data;
  },

  /**
   * Search for documents
   * @param searchQuery - Search parameters
   * @returns Promise with array of documents
   */
  searchDocuments: async (searchQuery: SearchQuery): Promise<Document[]> => {
    const response = await apiClient.post<Document[]>(
      '/retrieval/search',
      searchQuery
    );
    return response.data;
  },

  /**
   * Get a document by ID
   * @param id - Document ID
   * @returns Promise with document details
   */
  getDocument: async (id: string): Promise<Document> => {
    const response = await apiClient.get<Document>(
      `/retrieval/documents/${id}`
    );
    return response.data;
  },

  /**
   * Get recommended documents based on a question
   * @param question - The question text
   * @param sources - Optional array of source IDs to filter by
   * @param filters - Optional metadata filters to apply
   * @param limit - Optional maximum number of results to return
   * @returns Promise with array of recommended documents
   */
  getRecommendedDocuments: async (
    question: string,
    sources?: string[],
    filters?: Record<string, any>,
    limit?: number
  ): Promise<Document[]> => {
    console.log('Retrieving documents with params:', {
      query: question,
      sources,
      filters,
      max_results: limit || 10,
    });
    try {
      const response = await apiClient.post<Document[]>('/retrieval/search', {
        query: question,
        sources,
        filters,
        max_results: limit || 10,
      });
      console.log('Retrieved documents:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getRecommendedDocuments:', error);
      throw error;
    }
  },
};

export default RetrievalService;
