import { useQueryClient } from '@tanstack/react-query';

/**
 * Custom hook to invalidate all queries
 * Useful for clearing cache after logout or major state changes
 */
export const useInvalidateAllQueries = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries();
  };
};

/**
 * Custom hook to clear all query cache
 * More aggressive than invalidation - completely removes cached data
 */
export const useClearAllQueries = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.clear();
  };
};

/**
 * Utility function to create query keys
 * Helps maintain consistent query key structure
 */
export const createQueryKey = (
  namespace: string,
  ...identifiers: (string | number | undefined)[]
): string[] => {
  return [namespace, ...identifiers.filter(Boolean).map(String)];
};

/**
 * Common query key constants
 */
export const QUERY_KEYS = {
  AUTH: 'auth',
  USER: 'user',
  COLLECTIONS: 'collections',
  DOCUMENTS: 'documents',
  GENERATION: 'generation',
  QA_PAIRS: 'qa-pairs',
  RETRIEVAL: 'retrieval',
} as const;

export default {
  useInvalidateAllQueries,
  useClearAllQueries,
  createQueryKey,
  QUERY_KEYS,
};
