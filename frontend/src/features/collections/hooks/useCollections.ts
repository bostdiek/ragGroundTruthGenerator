/**
 * Collection Hooks
 * 
 * This file contains React Query hooks for collection-related API calls.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api/client';
import { Collection, CollectionCreateRequest, QAPair } from '../api/collections.service';

// Query keys
export const collectionKeys = {
  all: ['collections'] as const,
  lists: () => [...collectionKeys.all, 'list'] as const,
  list: (filters: string) => [...collectionKeys.lists(), { filters }] as const,
  details: () => [...collectionKeys.all, 'detail'] as const,
  detail: (id: string) => [...collectionKeys.details(), id] as const,
  qaPairs: (collectionId: string) => [...collectionKeys.detail(collectionId), 'qa-pairs'] as const,
  qaPair: (id: string) => [...collectionKeys.all, 'qa-pairs', id] as const,
};

/**
 * Hook to fetch all collections
 */
export const useCollections = () => {
  return useQuery({
    queryKey: collectionKeys.lists(),
    queryFn: async () => {
      const response = await apiClient.get<Collection[]>('/collections');
      return response.data;
    },
  });
};

/**
 * Hook to fetch a single collection by ID
 */
export const useCollection = (id: string) => {
  return useQuery({
    queryKey: collectionKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<Collection>(`/collections/${id}`);
      return response.data;
    },
    enabled: !!id, // Only run query if ID is provided
  });
};

/**
 * Hook to create a collection
 */
export const useCreateCollection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CollectionCreateRequest) => {
      const response = await apiClient.post<Collection>('/collections', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate collections list query to refetch the updated list
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
    },
  });
};

/**
 * Hook to update a collection
 */
export const useUpdateCollection = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<CollectionCreateRequest>) => {
      const response = await apiClient.put<Collection>(`/collections/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      // Update the collection in the cache
      queryClient.setQueryData(collectionKeys.detail(id), data);
      // Invalidate the collections list to refetch
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
    },
  });
};

/**
 * Hook to delete a collection
 */
export const useDeleteCollection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/collections/${id}`);
      return id;
    },
    onSuccess: (id) => {
      // Remove the collection from the cache
      queryClient.removeQueries({ queryKey: collectionKeys.detail(id) });
      // Invalidate the collections list to refetch
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
    },
  });
};

/**
 * Hook to fetch Q&A pairs for a collection
 */
export const useQAPairs = (collectionId: string) => {
  return useQuery({
    queryKey: collectionKeys.qaPairs(collectionId),
    queryFn: async () => {
      const response = await apiClient.get<QAPair[]>(`/collections/${collectionId}/qa-pairs`);
      return response.data;
    },
    enabled: !!collectionId, // Only run query if collection ID is provided
  });
};

/**
 * Hook to fetch a single Q&A pair by ID
 */
export const useQAPair = (id: string) => {
  return useQuery({
    queryKey: collectionKeys.qaPair(id),
    queryFn: async () => {
      const response = await apiClient.get<QAPair>(`/collections/qa-pairs/${id}`);
      return response.data;
    },
    enabled: !!id, // Only run query if ID is provided
  });
};
