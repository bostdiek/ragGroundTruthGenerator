import { apiClient } from '../../../lib/api/client';
import { GenerationRequest, GenerationResponse, Rule } from '../types';

/**
 * Service for answer generation API calls
 */
const GenerationService = {
  /**
   * Generate an answer based on selected documents
   * @param request - Generation request parameters
   * @returns Promise with generation response
   */
  generateAnswer: async (request: GenerationRequest): Promise<GenerationResponse> => {
    try {
      // Fix endpoint discrepancy - use /answer instead of /generate
      const response = await apiClient.post<GenerationResponse>('/generation/answer', request);
      return response.data;
    } catch (error: any) {
      console.error('Error generating answer:', error);
      throw new Error(error.response?.data?.detail || 'Failed to generate answer');
    }
  },
  
  /**
   * Get available answer generation rules
   * @returns Promise with array of rules
   */
  getRules: async (): Promise<Rule[]> => {
    try {
      const response = await apiClient.get<Rule[]>('/generation/rules');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching rules:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch rules');
    }
  },
  
  /**
   * Get a specific rule by ID
   * @param id - Rule ID
   * @returns Promise with rule details
   */
  getRule: async (id: string): Promise<Rule> => {
    try {
      const response = await apiClient.get<Rule>(`/generation/rules/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching rule ${id}:`, error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch rule');
    }
  },
  
  /**
   * Create a new rule
   * @param rule - Rule data
   * @returns Promise with created rule
   */
  createRule: async (rule: Omit<Rule, 'id'>): Promise<Rule> => {
    try {
      const response = await apiClient.post<Rule>('/generation/rules', rule);
      return response.data;
    } catch (error: any) {
      console.error('Error creating rule:', error);
      throw new Error(error.response?.data?.detail || 'Failed to create rule');
    }
  },
  
  /**
   * Update an existing rule
   * @param id - Rule ID
   * @param rule - Updated rule data
   * @returns Promise with updated rule
   */
  updateRule: async (id: string, rule: Partial<Omit<Rule, 'id'>>): Promise<Rule> => {
    try {
      const response = await apiClient.put<Rule>(`/generation/rules/${id}`, rule);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating rule ${id}:`, error);
      throw new Error(error.response?.data?.detail || 'Failed to update rule');
    }
  },
  
  /**
   * Delete a rule
   * @param id - Rule ID
   * @returns Promise with deletion confirmation
   */
  deleteRule: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/generation/rules/${id}`);
    } catch (error: any) {
      console.error(`Error deleting rule ${id}:`, error);
      throw new Error(error.response?.data?.detail || 'Failed to delete rule');
    }
  }
  
  // We've removed the models endpoint since it's not needed for the demo
  // The generation will always use the demo model
};

export default GenerationService;
