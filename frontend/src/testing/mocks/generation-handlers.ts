import { http, HttpResponse, delay } from 'msw';

// Define Document type for testing
interface Document {
  id: string;
  title: string;
  content: string;
  source: { id: string; name: string };
  metadata: Record<string, any>;
}

// Mock documents
export const mockDocuments: Document[] = [
  {
    id: 'doc-1',
    title: 'Test Document 1',
    content: 'This is test document 1 content.',
    source: { id: 'source-1', name: 'Test Source 1' },
    metadata: {}
  },
  {
    id: 'doc-2',
    title: 'Test Document 2',
    content: 'This is test document 2 content.',
    source: { id: 'source-1', name: 'Test Source 1' },
    metadata: {}
  }
];

// Mock generation response
export const mockGenerationResponse = {
  answer: 'This is a generated answer based on the provided documents.',
  model_used: 'test-model',
  token_usage: {
    prompt_tokens: 100,
    completion_tokens: 50,
    total_tokens: 150
  }
};

// Define generation request handlers
export const generationHandlers = [
  // Generate answer
  http.post('http://localhost:8000/generation/answer', async ({ request }) => {
    // Add a small delay to simulate network latency
    await delay(100);
    
    const body = await request.json() as { 
      question: string; 
      documents: Document[];
      rules?: Record<string, any>; 
    };
    
    // Check if request has the required fields
    if (!body.question || !body.documents || body.documents.length === 0) {
      return new HttpResponse(null, {
        status: 400,
        statusText: 'Bad Request',
      });
    }
    
    return HttpResponse.json(mockGenerationResponse);
  }),
  
  // Error scenario - server error
  http.post('http://localhost:8000/generation/error', async () => {
    await delay(50);
    
    return new HttpResponse(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }),
  
  // Get available rules
  http.get('http://localhost:8000/generation/rules', async () => {
    await delay(50);
    
    return HttpResponse.json([
      {
        id: 'rule-1',
        name: 'Fact Check',
        description: 'Verify all facts against the document content',
        enabled: true,
        parameters: {}
      },
      {
        id: 'rule-2',
        name: 'Simplify Language',
        description: 'Make the answer more readable',
        enabled: true,
        parameters: {
          complexity_level: 'medium'
        }
      }
    ]);
  })
];
