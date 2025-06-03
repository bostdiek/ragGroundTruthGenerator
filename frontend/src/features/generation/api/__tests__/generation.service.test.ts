import { describe, it, expect, vi, beforeAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../testing/setup';
import GenerationService from '../generation.service';
import { mockDocuments, mockGenerationResponse } from '../../../../testing/mocks/generation-handlers';

describe('GenerationService', () => {
  describe('generateAnswer', () => {
    it('should generate an answer from documents and question', async () => {
      // Setup the request data
      const requestData = {
        question: 'Test question?',
        documents: mockDocuments
      };
      
      // Make the API call
      const response = await GenerationService.generateAnswer(requestData);
      
      // Verify the response
      expect(response).toEqual(mockGenerationResponse);
    });
    
    it('should throw an error if the request fails', async () => {
      // Setup a server error response for this test only
      server.use(
        http.post('http://localhost:8000/generation/answer', () => {
          return new HttpResponse(null, {
            status: 500,
            statusText: 'Internal Server Error',
          });
        })
      );
      
      // Setup the request data
      const requestData = {
        question: 'Test question?',
        documents: mockDocuments
      };
      
      // Expect the API call to throw an error
      await expect(GenerationService.generateAnswer(requestData)).rejects.toThrow();
    });
  });
  
  describe('getRules', () => {
    it('should fetch available rules', async () => {
      // Make the API call
      const rules = await GenerationService.getRules();
      
      // Verify the response
      expect(rules).toHaveLength(2);
      expect(rules[0]).toHaveProperty('id', 'rule-1');
      expect(rules[1]).toHaveProperty('id', 'rule-2');
    });
    
    it('should throw an error if the request fails', async () => {
      // Setup a server error response for this test only
      server.use(
        http.get('http://localhost:8000/generation/rules', () => {
          return new HttpResponse(null, {
            status: 500,
            statusText: 'Internal Server Error',
          });
        })
      );
      
      // Expect the API call to throw an error
      await expect(GenerationService.getRules()).rejects.toThrow();
    });
  });
});
