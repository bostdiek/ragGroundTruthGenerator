import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import GenerationService from '../api/generation.service';
import {
  GenerationRequest,
  GenerationResponse,
  GenerationState,
} from '../types/index';

/**
 * Custom hook for answer generation functionality
 * Provides simplified access to the generation service with loading and error states
 */
export const useGeneration = () => {
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    generationError: null,
    generationInfo: null,
  });

  // Use React Query for the generation mutation
  const mutation = useMutation<GenerationResponse, Error, GenerationRequest>({
    mutationFn: request => GenerationService.generateAnswer(request),
    onMutate: () => {
      setState(prev => ({
        ...prev,
        isGenerating: true,
        generationError: null,
      }));
    },
    onSuccess: data => {
      setState(prev => ({
        ...prev,
        isGenerating: false,
        generationInfo: {
          model: data.model_used,
          tokens: data.token_usage,
        },
      }));
    },
    onError: error => {
      setState(prev => ({
        ...prev,
        isGenerating: false,
        generationError: error.message,
      }));
    },
  });

  /**
   * Generate an answer based on the provided question and documents
   */
  const generateAnswer = async (
    request: GenerationRequest
  ): Promise<GenerationResponse | null> => {
    try {
      return await mutation.mutateAsync(request);
    } catch (error) {
      console.error('Error generating answer:', error);
      return null;
    }
  };

  return {
    generateAnswer,
    ...state,
    isGenerating: mutation.isPending,
    reset: () => {
      setState({
        isGenerating: false,
        generationError: null,
        generationInfo: null,
      });
    },
  };
};
