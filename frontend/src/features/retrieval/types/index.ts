// Retrieval feature type definitions

// Re-export shared types from the app level
import { Document as AppDocument } from '../../../types';

export type { Document, Source } from '../../../types';

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
  offset?: number;
}

/**
 * Search result with pagination
 */
export interface SearchResult {
  documents: AppDocument[];
  totalCount: number;
  page: number;
  totalPages: number;
}

/**
 * Pagination interface for API responses
 */
export interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
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
 * Sort configuration
 */
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}
