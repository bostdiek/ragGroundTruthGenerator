// Retrieval feature type definitions

/**
 * Document representation
 */
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

/**
 * Search parameters
 */
export interface SearchParams {
  query: string;
  filters?: Record<string, any>;
  sort?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Search result with pagination
 */
export interface SearchResult {
  documents: Document[];
  totalCount: number;
  page: number;
  totalPages: number;
}

/**
 * Data source
 */
export interface Source {
  id: string;
  name: string;
  description: string;
  type?: string;
}

/**
 * Retrieval filters
 */
export interface RetrievalFilters {
  sourceIds?: string[];
  dateRange?: {
    from?: string;
    to?: string;
  };
  documentTypes?: string[];
  [key: string]: any;
}

/**
 * Generic pagination response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

/**
 * Sorting configuration
 */
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}
