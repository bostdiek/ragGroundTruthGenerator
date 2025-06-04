import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import RetrievalService from '../api/retrieval.service';
import type {
  PaginatedResponse,
  SearchParams,
  SearchResult,
  Source,
} from '../types';

/**
 * Hook for fetching available data sources with pagination
 *
 * @param page - Page number (1-indexed)
 * @param limit - Number of sources per page
 * @param options - Additional query options
 */
export const useSources = (page = 1, limit = 20, options = {}) => {
  return useQuery({
    queryKey: ['sources', page, limit],
    queryFn: () => RetrievalService.getSources(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook for paginated source listing with infinite scrolling
 *
 * @param limit - Number of sources per page
 * @param options - Additional query options
 */
export const useInfiniteSources = (limit = 20, options = {}) => {
  return useInfiniteQuery({
    queryKey: ['sources', 'infinite', limit],
    queryFn: ({ pageParam = 1 }) =>
      RetrievalService.getSources(pageParam, limit),
    getNextPageParam: (lastPage: PaginatedResponse<Source>) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook for searching documents with pagination, filtering, and sorting
 *
 * @param searchParams - Search parameters including pagination, filtering, and sorting
 * @param options - Additional query options
 */
export const useDocumentSearch = (searchParams: SearchParams, options = {}) => {
  return useQuery({
    queryKey: [
      'documents',
      'search',
      searchParams.query,
      searchParams.filters,
      searchParams.sort,
      searchParams.sortDirection,
      searchParams.page,
      searchParams.limit,
    ],
    queryFn: () => RetrievalService.searchDocuments(searchParams),
    enabled: !!searchParams.query, // Only run when query exists
    ...options,
  });
};

/**
 * Hook for searching documents with infinite scrolling
 *
 * @param searchParams - Search parameters excluding page
 * @param options - Additional query options
 */
export const useInfiniteDocumentSearch = (
  searchParams: Omit<SearchParams, 'page'>,
  options = {}
) => {
  return useInfiniteQuery({
    queryKey: [
      'documents',
      'search',
      'infinite',
      searchParams.query,
      searchParams.filters,
      searchParams.sort,
      searchParams.sortDirection,
      searchParams.limit,
    ],
    queryFn: ({ pageParam = 1 }) =>
      RetrievalService.searchDocuments({ ...searchParams, page: pageParam }),
    getNextPageParam: (lastPage: SearchResult) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!searchParams.query, // Only run when query exists
    ...options,
  });
};

/**
 * Hook for fetching recommended documents based on a question
 *
 * @param question - The question text
 * @param searchParams - Additional search parameters (filters, pagination, sorting)
 * @param options - Additional query options
 */
export const useRecommendedDocuments = (
  question: string,
  searchParams: Omit<SearchParams, 'query'> = {},
  options = {}
) => {
  return useQuery({
    queryKey: [
      'documents',
      'recommended',
      question,
      searchParams.filters,
      searchParams.sort,
      searchParams.sortDirection,
      searchParams.page,
      searchParams.limit,
    ],
    queryFn: () =>
      RetrievalService.getRecommendedDocuments(question, searchParams),
    enabled: !!question && (options as any)?.enabled !== false, // Only run when question exists and not disabled
    ...options,
  });
};

/**
 * Hook for fetching document suggestions based on partial input
 *
 * @param partialInput - Partial text input for suggestion
 * @param sources - Optional array of source IDs to filter by
 * @param limit - Maximum number of suggestions to return
 * @param options - Additional query options
 */
export const useDocumentSuggestions = (
  partialInput: string,
  sources?: string[],
  limit = 5,
  options = {}
) => {
  return useQuery({
    queryKey: ['documents', 'suggestions', partialInput, sources, limit],
    queryFn: () =>
      RetrievalService.getDocumentSuggestions(partialInput, sources, limit),
    enabled: partialInput.length >= 3, // Only run when input is at least 3 characters
    ...options,
  });
};
