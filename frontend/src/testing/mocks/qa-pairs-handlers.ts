import { http, HttpResponse, delay } from 'msw';
import { QAPair } from '../../types';

// Mock QA pairs data
export const mockQAPairs: QAPair[] = [
  {
    id: 'qa-1',
    collection_id: 'collection-1',
    question: 'Test question 1?',
    answer: 'Test answer 1',
    documents: [],
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    created_by: 'user-1',
    status: 'ready_for_review',
    metadata: {}
  },
  {
    id: 'qa-2',
    collection_id: 'collection-1',
    question: 'Test question 2?',
    answer: 'Test answer 2',
    documents: [],
    created_at: '2023-01-02T00:00:00Z',
    updated_at: '2023-01-02T00:00:00Z',
    created_by: 'user-1',
    status: 'approved',
    metadata: {}
  }
];

// Define QA pairs request handlers
export const qaPairsHandlers = [
  // Get QA pairs for a collection
  http.get('http://localhost:8000/collections/:collectionId/qa-pairs', async ({ params }) => {
    const { collectionId } = params;
    // Add a small delay to simulate network latency
    await delay(50);
    const filteredQAPairs = mockQAPairs.filter(qa => qa.collection_id === collectionId);
    return HttpResponse.json(filteredQAPairs);
  }),
  
  // Get a specific QA pair
  http.get('http://localhost:8000/collections/qa-pairs/:id', async ({ params }) => {
    const { id } = params;
    // Add a small delay to simulate network latency
    await delay(50);
    const qaPair = mockQAPairs.find(qa => qa.id === id);
    
    if (qaPair) {
      return HttpResponse.json(qaPair);
    }
    
    return new HttpResponse(null, {
      status: 404,
      statusText: 'Not Found',
    });
  }),
  
  // Create a QA pair
  http.post('http://localhost:8000/collections/:collectionId/qa-pairs', async ({ request, params }) => {
    const { collectionId } = params;
    const requestData = await request.json() as Partial<QAPair>;
    
    const newQAPair: QAPair = {
      id: `qa-${Date.now()}`,
      collection_id: collectionId as string,
      question: requestData.question || 'Default question',
      answer: requestData.answer || 'Default answer',
      documents: requestData.documents || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user-1',
      status: requestData.status || 'ready_for_review',
      metadata: requestData.metadata || {}
    };
    
    return HttpResponse.json(newQAPair);
  }),
  
  // Update a QA pair
  http.put('http://localhost:8000/collections/qa-pairs/:id', async ({ request, params }) => {
    const { id } = params;
    const requestData = await request.json() as Partial<QAPair>;
    
    const qaPair = mockQAPairs.find(qa => qa.id === id);
    
    if (qaPair) {
      const updatedQAPair: QAPair = {
        ...qaPair,
        question: requestData.question || qaPair.question,
        answer: requestData.answer || qaPair.answer,
        documents: requestData.documents || qaPair.documents,
        status: requestData.status || qaPair.status,
        metadata: { ...qaPair.metadata, ...(requestData.metadata || {}) },
        updated_at: new Date().toISOString()
      };
      
      return HttpResponse.json(updatedQAPair);
    }
    
    return new HttpResponse(null, {
      status: 404,
      statusText: 'Not Found',
    });
  }),
  
  // Update a QA pair status
  http.patch('http://localhost:8000/collections/qa-pairs/:id', async ({ request, params }) => {
    const { id } = params;
    const requestData = await request.json() as { 
      status?: string; 
      metadata?: Record<string, any>;
    };
    
    const qaPair = mockQAPairs.find(qa => qa.id === id);
    
    if (qaPair) {
      const updatedQAPair: QAPair = {
        ...qaPair,
        status: (requestData.status as QAPair['status']) || qaPair.status,
        metadata: {
          ...qaPair.metadata,
          ...(requestData.metadata || {})
        },
        updated_at: new Date().toISOString()
      };
      
      return HttpResponse.json(updatedQAPair);
    }
    
    return new HttpResponse(null, {
      status: 404,
      statusText: 'Not Found',
    });
  }),
  
  // Delete a QA pair
  http.delete('http://localhost:8000/collections/qa-pairs/:id', ({ params }) => {
    const { id } = params;
    const qaPair = mockQAPairs.find(qa => qa.id === id);
    
    if (qaPair) {
      return new HttpResponse(null, {
        status: 204,
        statusText: 'No Content',
      });
    }
    
    return new HttpResponse(null, {
      status: 404,
      statusText: 'Not Found',
    });
  })
];
