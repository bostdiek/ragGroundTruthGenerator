import { useQuery } from '@tanstack/react-query';

// Import types from the service instead to avoid unused imports
// import { Document, Source } from '../../../types';
import RetrievalService from '../api/retrieval.service';

/**
 * Hook for fetching available data sources
 */
export const useSources = () => {
  return useQuery({
    queryKey: ['sources'],
    queryFn: RetrievalService.getSources,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for searching documents based on a query
 */
export const useDocumentSearch = (
  query: string,
  sources?: string[],
  filters?: Record<string, any>,
  enabled = true
) => {
  return useQuery({
    queryKey: ['documents', 'search', query, sources, filters],
    queryFn: () =>
      RetrievalService.searchDocuments({
        query,
        sources,
        filters,
      }),
    enabled: enabled && !!query, // Only run when enabled and query exists
  });
};

/**
 * Hook for fetching recommended documents based on a question
 */
export const useRecommendedDocuments = (
  question: string,
  sources?: string[],
  filters?: Record<string, any>,
  enabled = true
) => {
  return useQuery({
    queryKey: ['documents', 'recommended', question, sources, filters],
    queryFn: () =>
      RetrievalService.getRecommendedDocuments(question, sources, filters),
    enabled: enabled && !!question, // Only run when enabled and question exists
  });
};
