import api from './api';
import { Collection as CoreCollection, Document, QAPair as CoreQAPair } from '../types';

// Types
export interface Collection extends CoreCollection {}

export interface QAPair extends CoreQAPair {}

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
    const response = await api.get<Collection[]>('/api/collections');
    return response.data;
  },
  
  /**
   * Get a specific collection by ID
   * @param id - Collection ID
   * @returns Promise with collection details
   */
  getCollection: async (id: string): Promise<Collection> => {
    const response = await api.get<Collection>(`/api/collections/${id}`);
    return response.data;
  },
  
  /**
   * Create a new collection
   * @param collection - Collection data
   * @returns Promise with created collection
   */
  createCollection: async (collection: CollectionCreateRequest): Promise<Collection> => {
    const response = await api.post<Collection>('/api/collections', collection);
    return response.data;
  },
  
  /**
   * Update an existing collection
   * @param id - Collection ID
   * @param collection - Updated collection data
   * @returns Promise with updated collection
   */
  updateCollection: async (id: string, collection: Partial<CollectionCreateRequest>): Promise<Collection> => {
    const response = await api.put<Collection>(`/api/collections/${id}`, collection);
    return response.data;
  },
  
  /**
   * Delete a collection
   * @param id - Collection ID
   * @returns Promise with deletion confirmation
   */
  deleteCollection: async (id: string): Promise<void> => {
    await api.delete(`/api/collections/${id}`);
  },
  
  /**
   * Get Q&A pairs for a collection
   * @param collectionId - Collection ID
   * @returns Promise with array of Q&A pairs
   */
  getQAPairs: async (collectionId: string): Promise<QAPair[]> => {
    const response = await api.get<QAPair[]>(`/api/collections/${collectionId}/qa-pairs`);
    return response.data;
  },
  
  /**
   * Get a specific Q&A pair by ID
   * @param id - Q&A pair ID
   * @returns Promise with Q&A pair details
   */
  getQAPair: async (id: string): Promise<QAPair> => {
    const response = await api.get<QAPair>(`/api/collections/qa-pairs/${id}`);
    return response.data;
  },
  
  /**
   * Create a new Q&A pair
   * @param collectionId - Collection ID
   * @param qaPair - Q&A pair data
   * @returns Promise with created Q&A pair
   */
  createQAPair: async (collectionId: string, qaPair: Partial<QAPair>): Promise<QAPair> => {
    const response = await api.post<QAPair>(`/api/collections/${collectionId}/qa-pairs`, qaPair);
    return response.data;
  },
  
  /**
   * Update an existing Q&A pair
   * @param id - Q&A pair ID
   * @param qaPair - Updated Q&A pair data
   * @returns Promise with updated Q&A pair
   */
  updateQAPair: async (id: string, qaPair: Partial<QAPair>): Promise<QAPair> => {
    console.log("CollectionsService.updateQAPair called with id:", id, "and data:", qaPair);
    try {
      // Add timeout to prevent request hanging indefinitely
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await api.put<QAPair>(
        `/api/collections/qa-pairs/${id}`, 
        qaPair,
        { signal: controller.signal }
      );
      
      clearTimeout(timeoutId);
      console.log("CollectionsService.updateQAPair response:", response.data);
      return response.data;
    } catch (error) {
      console.error("CollectionsService.updateQAPair error:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message);
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
    const response = await api.patch<QAPair>(`/api/collections/qa-pairs/${id}`, { status });
    return response.data;
  },
  
  /**
   * Update the status of a Q&A pair with revision comments
   * @param id - Q&A pair ID
   * @param status - New status
   * @param revisionComments - Comments explaining the revision request
   * @returns Promise with updated Q&A pair
   */
  updateQAPairStatusWithComments: async (id: string, status: string, revisionComments: string): Promise<QAPair> => {
    console.log(`Updating QA pair ${id} status to ${status} with comments: ${revisionComments}`);
    
    try {
      // First get the current QA pair to preserve existing metadata
      const currentQA = await api.get<QAPair>(`/api/collections/qa-pairs/${id}`);
      const currentMetadata = currentQA.data.metadata || {};
      
      // Merge existing metadata with new revision comments
      const response = await api.patch<QAPair>(`/api/collections/qa-pairs/${id}`, { 
        status,
        metadata: {
          ...currentMetadata,
          revision_comments: revisionComments
        }
      });
      
      console.log("Update with comments response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating QA pair with comments:", error);
      throw error;
    }
  },

  /**
   * Delete a Q&A pair
   * @param id - Q&A pair ID
   * @returns Promise with deletion confirmation
   */
  deleteQAPair: async (id: string): Promise<void> => {
    await api.delete(`/api/collections/qa-pairs/${id}`);
  }
};

export default CollectionsService;
