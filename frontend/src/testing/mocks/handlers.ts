import { delay, http, HttpResponse } from 'msw';

import { generationHandlers } from './generation-handlers';
import { qaPairsHandlers } from './qa-pairs-handlers';

// Mock user data
export const mockUser = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  full_name: 'Test User',
};

// Mock token response
export const mockTokenResponse = {
  access_token: 'mock-jwt-token',
  token_type: 'bearer',
  user: mockUser,
};

// Define request handlers
export const authHandlers = [
  // Auth endpoints
  http.post('http://localhost:8000/auth/login', async ({ request }) => {
    const body = (await request.json()) as {
      username: string;
      password: string;
    };
    const { username, password } = body;

    if (username === 'testuser' && password === 'password') {
      return HttpResponse.json(mockTokenResponse);
    }

    return new HttpResponse(null, {
      status: 401,
      statusText: 'Unauthorized',
    });
  }),

  http.get('http://localhost:8000/auth/me', ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.includes('Bearer mock-jwt-token')) {
      return new HttpResponse(null, { status: 401 });
    }

    return HttpResponse.json(mockUser);
  }),
];

// Collections endpoints
export const collectionsHandlers = [
  http.get('http://localhost:8000/collections', async () => {
    // Add a small delay to simulate network latency (but not too long)
    await delay(50);
    return HttpResponse.json([
      {
        id: '1',
        name: 'Test Collection',
        description: 'A collection for testing',
        created_at: '2025-05-01T12:00:00Z',
        updated_at: '2025-05-02T12:00:00Z',
        tags: ['test', 'sample'],
        qa_pair_count: 5,
      },
      {
        id: '2',
        name: 'Another Collection',
        description: 'Another collection for testing',
        created_at: '2025-05-03T12:00:00Z',
        updated_at: '2025-05-04T12:00:00Z',
        tags: ['production', 'important'],
        qa_pair_count: 10,
      },
    ]);
  }),

  http.get('http://localhost:8000/collections/:id', async () => {
    // Add a small delay to simulate network latency
    await delay(50);
    return HttpResponse.json({
      id: '1',
      name: 'Test Collection',
      description: 'A collection for testing',
      created_at: '2025-05-01T12:00:00Z',
      updated_at: '2025-05-02T12:00:00Z',
      tags: ['test', 'sample'],
      qa_pairs: [
        {
          id: '1',
          collection_id: '1',
          question: 'What is a test question?',
          answer: 'Test answer',
          created_at: '2025-05-01T14:00:00Z',
          status: 'approved',
          documents: [],
          created_by: 'user-1',
          metadata: {},
          updated_at: '2025-05-02T14:00:00Z',
        },
        {
          id: '2',
          collection_id: '1',
          question: 'Another test question?',
          answer: 'Another test answer',
          created_at: '2025-05-03T14:00:00Z',
          status: 'draft',
          documents: [],
          created_by: 'user-1',
          metadata: {},
          updated_at: '2025-05-04T14:00:00Z',
        },
      ],
    });
  }),
];

// Combine all handlers
export const handlers = [
  ...authHandlers,
  ...collectionsHandlers,
  ...qaPairsHandlers,
  ...generationHandlers,
];
