/**
 * Type definitions for the generation feature
 */

import { Document } from '../../../types';

/**
 * Request parameters for generating an answer
 */
export interface GenerationRequest {
  question: string;
  documents: Document[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  custom_rules?: string[];
}

/**
 * Response from the answer generation API
 */
export interface GenerationResponse {
  answer: string;
  model_used: string;
  token_usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Custom rule for answer generation
 */
export interface Rule {
  id: string;
  description: string;
  type: string;
}

/**
 * State for the generation process
 */
export interface GenerationState {
  isGenerating: boolean;
  generationError: string | null;
  generationInfo: {
    model: string;
    tokens: Record<string, number>;
  } | null;
}
