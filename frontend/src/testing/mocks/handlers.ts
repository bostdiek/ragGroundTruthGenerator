import { http, HttpResponse } from 'msw';

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
export const handlers = [
  // Auth endpoints
  http.post('http://localhost:8000/auth/login', async ({ request }) => {
    const body = await request.json() as { username: string; password: string };
    const { username, password } = body;
    
    if (username === 'testuser' && password === 'password') {
      return HttpResponse.json(mockTokenResponse);
    }
    
    return new HttpResponse(null, {
      status: 401,
      statusText: 'Unauthorized',
    });
  }),
  
  http.get('http://localhost:8000/auth/me', () => {
    return HttpResponse.json(mockUser);
  }),
  
  // Collections endpoints
  http.get('http://localhost:8000/collections', () => {
    return HttpResponse.json([
      {
        id: '1',
        name: 'Test Collection',
        description: 'A collection for testing',
        created_at: '2025-05-01T12:00:00Z',
        updated_at: '2025-05-02T12:00:00Z',
      },
      {
        id: '2',
        name: 'Another Collection',
        description: 'Another collection for testing',
        created_at: '2025-05-03T12:00:00Z',
        updated_at: '2025-05-04T12:00:00Z',
      },
    ]);
  }),
  
  http.get('http://localhost:8000/collections/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: 'Test Collection',
      description: 'A collection for testing',
      created_at: '2025-05-01T12:00:00Z',
      updated_at: '2025-05-02T12:00:00Z',
      qa_pairs: [
        {
          id: '1',
          question: 'Test question?',
          answer: 'Test answer',
          created_at: '2025-05-01T14:00:00Z',
        },
      ],
    });
  }),
];
