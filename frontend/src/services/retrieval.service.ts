import api from './api';

// Types
export interface Document {
  id: string;
  title: string;
  content: string;
  source: string;
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
    const response = await api.get<Source[]>('/retrieval/sources');
    return response.data;
  },
  
  /**
   * Search for documents
   * @param searchQuery - Search parameters
   * @returns Promise with array of documents
   */
  searchDocuments: async (searchQuery: SearchQuery): Promise<Document[]> => {
    const response = await api.post<Document[]>('/retrieval/search', searchQuery);
    return response.data;
  },
  
  /**
   * Get a document by ID
   * @param id - Document ID
   * @returns Promise with document details
   */
  getDocument: async (id: string): Promise<Document> => {
    const response = await api.get<Document>(`/retrieval/documents/${id}`);
    return response.data;
  },
  
  /**
   * Get recommended documents based on a question
   * @param question - The question text
   * @param sources - Optional array of source IDs to filter by
   * @returns Promise with array of recommended documents
   */
  getRecommendedDocuments: async (question: string, sources?: string[]): Promise<Document[]> => {
    const response = await api.post<Document[]>('/retrieval/recommend', {
      question,
      sources
    });
    return response.data;
  }
};

export default RetrievalService;
