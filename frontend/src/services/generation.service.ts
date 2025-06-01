import api from './api';
import { Document } from '../types';

// Types
export interface GenerationRequest {
  question: string;
  documents: Document[]; // Array of document objects
  model?: string;
  temperature?: number;
  max_tokens?: number;
  rules?: Rule[];
}

export interface GenerationResponse {
  answer: string;
  model_used?: string;
  tokens_used?: number;
  processing_time?: number;
  document_references?: Document[];
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
    const response = await api.post<GenerationResponse>('/generation/answer', request);
    return response.data;
  },
  
  /**
   * Get available answer generation rules
   * @returns Promise with array of rules
   */
  getRules: async (): Promise<Rule[]> => {
    const response = await api.get<Rule[]>('/generation/rules');
    return response.data;
  },
  
  /**
   * Get a specific rule by ID
   * @param id - Rule ID
   * @returns Promise with rule details
   */
  getRule: async (id: string): Promise<Rule> => {
    const response = await api.get<Rule>(`/generation/rules/${id}`);
    return response.data;
  },
  
  /**
   * Create a new rule
   * @param rule - Rule data
   * @returns Promise with created rule
   */
  createRule: async (rule: Omit<Rule, 'id'>): Promise<Rule> => {
    const response = await api.post<Rule>('/generation/rules', rule);
    return response.data;
  },
  
  /**
   * Update an existing rule
   * @param id - Rule ID
   * @param rule - Updated rule data
   * @returns Promise with updated rule
   */
  updateRule: async (id: string, rule: Partial<Omit<Rule, 'id'>>): Promise<Rule> => {
    const response = await api.put<Rule>(`/generation/rules/${id}`, rule);
    return response.data;
  },
  
  /**
   * Delete a rule
   * @param id - Rule ID
   * @returns Promise with deletion confirmation
   */
  deleteRule: async (id: string): Promise<void> => {
    await api.delete(`/generation/rules/${id}`);
  },
  
  /**
   * Get available models for answer generation
   * @returns Promise with array of model names and details
   */
  getModels: async (): Promise<{ id: string; name: string; description: string }[]> => {
    const response = await api.get<{ id: string; name: string; description: string }[]>('/generation/models');
    return response.data;
  }
};

export default GenerationService;
