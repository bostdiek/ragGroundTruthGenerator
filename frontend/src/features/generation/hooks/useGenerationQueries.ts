import { useMutation, useQuery } from '@tanstack/react-query';

import GenerationService from '../api/generation.service';
import { GenerationRequest, GenerationResponse, Rule } from '../types';

/**
 * Query key for generation queries
 */
const GENERATION_QUERY_KEYS = {
  rules: ['rules'],
  rule: (id: string) => ['rule', id],
  generation: ['generation'],
};

/**
 * Hook for generating answers
 */
export const useGenerateAnswer = () => {
  return useMutation<GenerationResponse, Error, GenerationRequest>({
    mutationFn: request => GenerationService.generateAnswer(request),
    // No need for invalidation as each generation is unique
  });
};

/**
 * Hook for fetching all available rules
 */
export const useRules = () => {
  return useQuery({
    queryKey: GENERATION_QUERY_KEYS.rules,
    queryFn: () => GenerationService.getRules(),
  });
};

/**
 * Hook for fetching a specific rule by ID
 */
export const useRule = (id: string) => {
  return useQuery({
    queryKey: GENERATION_QUERY_KEYS.rule(id),
    queryFn: () => GenerationService.getRule(id),
    // Only fetch if ID is provided
    enabled: !!id,
  });
};

/**
 * Hook for creating a new rule
 */
export const useCreateRule = () => {
  return useMutation({
    mutationFn: (rule: Omit<Rule, 'id'>) => GenerationService.createRule(rule),
    // Add invalidation to refresh rules list after creation
    onSuccess: (_, __, context) => {
      // Optionally add queryClient invalidation here if needed
    },
  });
};

/**
 * Hook for updating an existing rule
 */
export const useUpdateRule = () => {
  return useMutation({
    mutationFn: ({
      id,
      rule,
    }: {
      id: string;
      rule: Partial<Omit<Rule, 'id'>>;
    }) => GenerationService.updateRule(id, rule),
    // Add invalidation to refresh rule after update
    onSuccess: (_, variables) => {
      // Optionally add queryClient invalidation here if needed
    },
  });
};

/**
 * Hook for deleting a rule
 */
export const useDeleteRule = () => {
  return useMutation({
    mutationFn: (id: string) => GenerationService.deleteRule(id),
    // Add invalidation to refresh rules list after deletion
    onSuccess: () => {
      // Optionally add queryClient invalidation here if needed
    },
  });
};
