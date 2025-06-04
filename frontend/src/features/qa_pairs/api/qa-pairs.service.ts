import { apiClient } from '../../../lib/api/client';
import { QAPair } from '../../../types';

/**
 * Service for QA pair-related API calls
 */
const QAPairsService = {
  /**
   * Get Q&A pairs for a collection
   * @param collectionId - Collection ID
   * @returns Promise with array of Q&A pairs
   */
  getQAPairs: async (collectionId: string): Promise<QAPair[]> => {
    const response = await apiClient.get<QAPair[]>(
      `/collections/${collectionId}/qa-pairs`
    );
    return response.data;
  },

  /**
   * Get a specific Q&A pair by ID
   * @param id - Q&A pair ID
   * @returns Promise with Q&A pair details
   */
  getQAPair: async (id: string): Promise<QAPair> => {
    const response = await apiClient.get<QAPair>(`/collections/qa-pairs/${id}`);
    return response.data;
  },

  /**
   * Create a new Q&A pair
   * @param collectionId - Collection ID
   * @param qaPair - Q&A pair data
   * @returns Promise with created Q&A pair
   */
  createQAPair: async (
    collectionId: string,
    qaPair: Partial<QAPair>
  ): Promise<QAPair> => {
    const response = await apiClient.post<QAPair>(
      `/collections/${collectionId}/qa-pairs`,
      qaPair
    );
    return response.data;
  },

  /**
   * Update an existing Q&A pair
   * @param id - Q&A pair ID
   * @param qaPair - Updated Q&A pair data
   * @returns Promise with updated Q&A pair
   */
  updateQAPair: async (
    id: string,
    qaPair: Partial<QAPair>
  ): Promise<QAPair> => {
    const response = await apiClient.put<QAPair>(
      `/collections/qa-pairs/${id}`,
      qaPair
    );
    return response.data;
  },

  /**
   * Update the status of a Q&A pair
   * @param id - Q&A pair ID
   * @param status - New status
   * @returns Promise with updated Q&A pair
   */
  updateQAPairStatus: async (id: string, status: string): Promise<QAPair> => {
    const response = await apiClient.patch<QAPair>(
      `/collections/qa-pairs/${id}`,
      { status }
    );
    return response.data;
  },

  /**
   * Update the status of a Q&A pair with revision comments
   * @param id - Q&A pair ID
   * @param status - New status
   * @param revisionComments - Comments explaining the revision request
   * @returns Promise with updated Q&A pair
   */
  updateQAPairStatusWithComments: async (
    id: string,
    status: string,
    revisionComments: string
  ): Promise<QAPair> => {
    // First get the current QA pair to preserve existing metadata
    const currentQA = await QAPairsService.getQAPair(id);
    const currentMetadata = currentQA.metadata || {};

    // Merge existing metadata with new revision comments
    const response = await apiClient.patch<QAPair>(
      `/collections/qa-pairs/${id}`,
      {
        status,
        metadata: {
          ...currentMetadata,
          revision_comments: revisionComments,
        },
      }
    );

    return response.data;
  },

  /**
   * Delete a Q&A pair
   * @param id - Q&A pair ID
   * @returns Promise with deletion confirmation
   */
  deleteQAPair: async (id: string): Promise<void> => {
    await apiClient.delete(`/collections/qa-pairs/${id}`);
  },
};

export default QAPairsService;
