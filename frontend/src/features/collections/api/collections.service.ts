import axios from 'axios';

import { apiClient } from '../../../lib/api/client';
import {
  Collection as CoreCollection,
  QAPair as CoreQAPair,
} from '../../../types';

// Types
export type Collection = CoreCollection;

export type QAPair = CoreQAPair;

export interface CollectionCreateRequest {
  name: string;
  description: string;
  tags?: string[];
}

/**
 * Service for collection-related API calls
 */
const CollectionsService = {
  /**
   * Get all collections
   * @returns Promise with array of collections
   */
  getCollections: async (): Promise<Collection[]> => {
    const response = await apiClient.get<Collection[]>('/collections');
    return response.data;
  },

  /**
   * Get a specific collection by ID
   * @param id - Collection ID
   * @returns Promise with collection details
   */
  getCollection: async (id: string): Promise<Collection> => {
    const response = await apiClient.get<Collection>(`/collections/${id}`);
    return response.data;
  },

  /**
   * Create a new collection
   * @param collection - Collection data
   * @returns Promise with created collection
   */
  createCollection: async (
    collection: CollectionCreateRequest
  ): Promise<Collection> => {
    const response = await apiClient.post<Collection>(
      '/collections',
      collection
    );
    return response.data;
  },

  /**
   * Update an existing collection
   * @param id - Collection ID
   * @param collection - Updated collection data
   * @returns Promise with updated collection
   */
  updateCollection: async (
    id: string,
    collection: Partial<CollectionCreateRequest>
  ): Promise<Collection> => {
    const response = await apiClient.put<Collection>(
      `/collections/${id}`,
      collection
    );
    return response.data;
  },

  /**
   * Delete a collection
   * @param id - Collection ID
   * @returns Promise with deletion confirmation
   */
  deleteCollection: async (id: string): Promise<void> => {
    await apiClient.delete(`/collections/${id}`);
  },

  /**
   * Get Q&A pairs for a collection
   * @param collectionId - Collection ID
   * @returns Promise with array of Q&A pairs
   */
  getQAPairs: async (collectionId: string): Promise<QAPair[]> => {
    console.log(`Fetching QA pairs for collection: ${collectionId}`);
    try {
      const response = await apiClient.get<QAPair[]>(
        `/collections/${collectionId}/qa-pairs`
      );
      console.log('QA pairs response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching QA pairs:', error);
      throw error;
    }
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
    console.log(
      'CollectionsService.updateQAPair called with id:',
      id,
      'and data:',
      qaPair
    );
    try {
      // Ensure all data is JSON serializable before sending
      const sanitizeForJson = (obj: any): any => {
        // Handle null and undefined
        if (obj === null || obj === undefined) {
          return obj;
        }

        // Handle Date objects
        if (obj instanceof Date) {
          return obj.toISOString();
        }

        // Handle arrays
        if (Array.isArray(obj)) {
          return obj.map(sanitizeForJson);
        }

        // Handle objects (but not Date instances, which are also objects)
        if (typeof obj === 'object' && obj.constructor === Object) {
          const sanitized: any = {};
          for (const [key, value] of Object.entries(obj)) {
            sanitized[key] = sanitizeForJson(value);
          }
          return sanitized;
        }

        // Handle functions (convert to null or remove)
        if (typeof obj === 'function') {
          return null;
        }

        // Handle undefined (convert to null)
        if (obj === undefined) {
          return null;
        }

        // Handle symbols (convert to string)
        if (typeof obj === 'symbol') {
          return obj.toString();
        }

        // Handle BigInt (convert to string)
        if (typeof obj === 'bigint') {
          return obj.toString();
        }

        // Return primitives as-is (string, number, boolean)
        return obj;
      };

      const sanitizedQAPair = sanitizeForJson(qaPair);

      // Test JSON serialization to catch any remaining issues
      try {
        JSON.stringify(sanitizedQAPair);
        console.log('JSON serialization test passed for QA pair data');
      } catch (jsonError) {
        console.error('JSON serialization failed:', jsonError);
        console.error('Problematic data:', sanitizedQAPair);
        throw new Error(`Data is not JSON serializable: ${jsonError}`);
      }

      console.log(
        'CollectionsService.updateQAPair sanitized data:',
        JSON.stringify(sanitizedQAPair, null, 2)
      );

      // Add timeout to prevent request hanging indefinitely
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await apiClient.patch<QAPair>(
        `/collections/qa-pairs/${id}`,
        sanitizedQAPair,
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);
      return response.data;
    } catch (error) {
      console.error('CollectionsService.updateQAPair error:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
      if (axios.isAxiosError(error) && error.response) {
        console.error('Server response:', error.response.data);
      }
      throw error;
    }
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
    console.log(
      `Updating QA pair ${id} status to ${status} with comments: ${revisionComments}`
    );

    try {
      // First get the current QA pair to preserve existing metadata
      const currentQA = await apiClient.get<QAPair>(
        `/collections/qa-pairs/${id}`
      );
      const currentMetadata = currentQA.data.metadata || {};

      // Get current user info for the revision requester
      const currentUser = localStorage.getItem('auth_user') || 'unknown_user';
      const currentTime = new Date().toISOString();

      // Merge existing metadata with new revision comments
      const response = await apiClient.patch<QAPair>(
        `/collections/qa-pairs/${id}`,
        {
          status,
          metadata: {
            ...currentMetadata,
            revision_comments: revisionComments,
            revision_feedback: revisionComments,
            revision_requested_by: currentUser,
            revision_requested_at: currentTime,
          },
        }
      );

      console.log('Update with comments response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating QA pair with comments:', error);
      throw error;
    }
  },

  /**
   * Delete a Q&A pair
   * @param id - Q&A pair ID
   * @returns Promise with deletion confirmation
   */
  deleteQAPair: async (id: string): Promise<void> => {
    await apiClient.delete(`/collections/qa-pairs/${id}`);
  },

  /**
   * Export QA pairs to JSONL format and download to user's machine
   * @param qaPairs - Array of QA pairs to export
   * @param collectionName - Name of the collection
   * @param activeStatus - Current status filter
   * @param hasSearch - Whether search filter is applied
   */
  exportToJSONL: (
    qaPairs: QAPair[],
    collectionName: string,
    activeStatus: string,
    hasSearch: boolean
  ): void => {
    // Generate timestamp in YYYYMMDD-HHMM format
    const now = new Date();
    const timestamp = now
      .toISOString()
      .slice(0, 16)
      .replace(/[-:]/g, '')
      .replace('T', '-');

    // Build filename
    const sanitizedCollectionName = collectionName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');

    const statusPart = activeStatus === 'all' ? 'all' : activeStatus;
    const searchPart = hasSearch ? '_search' : '';
    const filename = `${sanitizedCollectionName}_${statusPart}${searchPart}_${timestamp}.jsonl`;

    // Convert QA pairs to JSONL format
    const jsonlContent = qaPairs
      .map(qaPair => {
        const exportData = {
          question: qaPair.question,
          answer: qaPair.answer,
          documents: qaPair.documents,
          status: qaPair.status,
          metadata: {
            ...qaPair.metadata,
            collection_id: qaPair.collection_id,
            created_at: qaPair.created_at,
            updated_at: qaPair.updated_at,
            created_by: qaPair.created_by,
          },
        };
        return JSON.stringify(exportData);
      })
      .join('\n');

    // Create blob and download
    const blob = new Blob([jsonlContent], { type: 'application/jsonl' });
    const url = URL.createObjectURL(blob);

    // Create temporary download link
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up object URL
    URL.revokeObjectURL(url);
  },
};

export default CollectionsService;
