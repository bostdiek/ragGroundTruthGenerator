import api from './api';
import { Document } from '../types';

// Types
export interface GenerationRequest {
  question: string;
  documents: Document[]; 
  model?: string;
  temperature?: number;
  max_tokens?: number;
  custom_rules?: string[];
}

export interface GenerationResponse {
  answer: string;
  model_used: string;
  token_usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface Rule {
  id: string;
  description: string;
  type: string;
}

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
    const response = await api.post<GenerationResponse>('/api/generation/generate', request);
    return response.data;
  },
  
  /**
   * Get available answer generation rules
   * @returns Promise with array of rules
   */
  getRules: async (): Promise<Rule[]> => {
    const response = await api.get<Rule[]>('/api/generation/rules');
    return response.data;
  },
  
  /**
   * Get a specific rule by ID
   * @param id - Rule ID
   * @returns Promise with rule details
   */
  getRule: async (id: string): Promise<Rule> => {
    const response = await api.get<Rule>(`/api/generation/rules/${id}`);
    return response.data;
  },
  
  /**
   * Create a new rule
   * @param rule - Rule data
   * @returns Promise with created rule
   */
  createRule: async (rule: Omit<Rule, 'id'>): Promise<Rule> => {
    const response = await api.post<Rule>('/api/generation/rules', rule);
    return response.data;
  },
  
  /**
   * Update an existing rule
   * @param id - Rule ID
   * @param rule - Updated rule data
   * @returns Promise with updated rule
   */
  updateRule: async (id: string, rule: Partial<Omit<Rule, 'id'>>): Promise<Rule> => {
    const response = await api.put<Rule>(`/api/generation/rules/${id}`, rule);
    return response.data;
  },
  
  /**
   * Delete a rule
   * @param id - Rule ID
   * @returns Promise with deletion confirmation
   */
  deleteRule: async (id: string): Promise<void> => {
    await api.delete(`/api/generation/rules/${id}`);
  }
  
  // We've removed the models endpoint since it's not needed for the demo
  // The generation will always use the demo model
  /*
  getModels: async (): Promise<{ id: string; name: string; description: string }[]> => {
    const response = await api.get<{ id: string; name: string; description: string }[]>('/api/generation/models');
    return response.data;
  }
  */
};

export default GenerationService;
