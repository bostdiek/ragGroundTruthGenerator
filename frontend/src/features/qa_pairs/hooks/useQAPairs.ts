/**
 * QA Pairs Hooks
 *
 * This file contains React Query hooks for QA pair-related API calls.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { QAPair } from '../../../types';
import QAPairsService from '../api/qa-pairs.service';

// Query keys
export const qaPairKeys = {
  all: ['qa-pairs'] as const,
  lists: () => [...qaPairKeys.all, 'list'] as const,
  list: (collectionId: string) =>
    [...qaPairKeys.lists(), collectionId] as const,
  details: () => [...qaPairKeys.all, 'detail'] as const,
  detail: (id: string) => [...qaPairKeys.details(), id] as const,
};

/**
 * Hook to fetch all QA pairs for a collection
 */
export const useQAPairs = (collectionId: string) => {
  return useQuery({
    queryKey: qaPairKeys.list(collectionId),
    queryFn: () => QAPairsService.getQAPairs(collectionId),
    enabled: !!collectionId, // Only run query if collection ID is provided
  });
};

/**
 * Hook to fetch a single QA pair by ID
 */
export const useQAPair = (id: string) => {
  return useQuery({
    queryKey: qaPairKeys.detail(id),
    queryFn: () => QAPairsService.getQAPair(id),
    enabled: !!id, // Only run query if ID is provided
  });
};

/**
 * Hook to create a QA pair
 */
export const useCreateQAPair = (collectionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (qaPair: Partial<QAPair>) =>
      QAPairsService.createQAPair(collectionId, qaPair),
    onSuccess: data => {
      // Invalidate QA pairs list for the collection to refetch
      queryClient.invalidateQueries({
        queryKey: qaPairKeys.list(collectionId),
      });
    },
  });
};

/**
 * Hook to update a QA pair
 */
export const useUpdateQAPair = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (qaPair: Partial<QAPair>) =>
      QAPairsService.updateQAPair(id, qaPair),
    onSuccess: data => {
      // Update the QA pair in the cache
      queryClient.setQueryData(qaPairKeys.detail(id), data);

      // Invalidate the QA pairs list for the collection to refetch
      if (data.collection_id) {
        queryClient.invalidateQueries({
          queryKey: qaPairKeys.list(data.collection_id),
        });
      }
    },
  });
};

/**
 * Hook to update a QA pair status
 */
export const useUpdateQAPairStatus = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: string) =>
      QAPairsService.updateQAPairStatus(id, status),
    onSuccess: data => {
      // Update the QA pair in the cache
      queryClient.setQueryData(qaPairKeys.detail(id), data);

      // Invalidate the QA pairs list for the collection to refetch
      if (data.collection_id) {
        queryClient.invalidateQueries({
          queryKey: qaPairKeys.list(data.collection_id),
        });
      }
    },
  });
};

/**
 * Hook to update a QA pair status with revision comments
 */
export const useUpdateQAPairStatusWithComments = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      status,
      revisionComments,
    }: {
      status: string;
      revisionComments: string;
    }) =>
      QAPairsService.updateQAPairStatusWithComments(
        id,
        status,
        revisionComments
      ),
    onSuccess: data => {
      // Update the QA pair in the cache
      queryClient.setQueryData(qaPairKeys.detail(id), data);

      // Invalidate the QA pairs list for the collection to refetch
      if (data.collection_id) {
        queryClient.invalidateQueries({
          queryKey: qaPairKeys.list(data.collection_id),
        });
      }
    },
  });
};

/**
 * Hook to delete a QA pair
 */
export const useDeleteQAPair = (collectionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => QAPairsService.deleteQAPair(id),
    onSuccess: (_, id) => {
      // Remove the QA pair from the cache
      queryClient.removeQueries({ queryKey: qaPairKeys.detail(id) });

      // Invalidate the QA pairs list for the collection to refetch
      queryClient.invalidateQueries({
        queryKey: qaPairKeys.list(collectionId),
      });
    },
  });
};
