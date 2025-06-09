# Frontend APIs & Service Layer

This document outlines the frontend's API patterns, service layer design, and how to work with backend integrations.

## Table of Contents

- [Service Layer Architecture](#service-layer-architecture)
- [API Client Design](#api-client-design)
- [State Management Integration](#state-management-integration)
- [Error Handling](#error-handling)
- [Authentication & Authorization](#authentication--authorization)
- [Data Transformation](#data-transformation)
- [Testing API Services](#testing-api-services)

## Service Layer Architecture

The frontend code is organized by feature, with API clients under `src/lib/api` and feature-specific services and providers:

```text
src/
├── lib/
│   └── api/
│       └── client.ts       # Axios instance with interceptors and error handling
├── config/
│   └── index.ts            # Application configuration (api, auth, features, ui)
├── features/
│   ├── auth/
│   │   └── api/             # Auth API (login, logout, profile)
│   ├── collections/
│   │   └── api/             # Collection CRUD services
│   ├── retrieval/
│   │   └── api/             # Document retrieval services
│   └── generation/
│       └── api/             # Answer generation services
├── types/                   # Core TypeScript interfaces (Collection, QAPair, Document, etc.)
└── providers/               # React context providers (AuthProvider, CollectionsProvider, etc.)
```

### Core Principles

1. **Separation of Concerns**: Services handle API logic, stores handle state
2. **Type Safety**: All API interactions are fully typed
3. **Error Boundaries**: Consistent error handling across all services
4. **Extensibility**: Easy to swap providers or add new endpoints

## API Client Design

### API Client

The base `axios` client is configured in `src/lib/api/client.ts` and handles JSON headers, auth tokens, logging, and error transformation:

```typescript
// src/lib/api/client.ts
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(/* attach auth token */);
apiClient.interceptors.response.use(
  response => response,
  error => Promise.reject(createApiError(error))
);

export const createApiError = (error: any): Error => { /* standardized error */ };
```

### Configuration

All application settings, including API URLs, endpoints, auth providers, feature flags, and UI defaults, live in `src/config/index.ts` under the `config` object:

```typescript
// src/config/index.ts
export default {
  api: {
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:8000',
    timeout: 30000,
    version: 'v1',
    endpoints: {
      auth: '/auth',
      collections: '/collections',
      retrieval: '/retrieval',
      generation: '/generation',
    },
  },
  auth: { /* auth provider settings and keys */ },
  features: { /* feature flags */ },
  ui: { /* pagination, formatting, etc. */ },
  retrieval: { /* retrieval limits */ },
  generation: { /* default rules */ },
};
```

## State Management Integration

### Store Pattern

Services integrate with state stores to provide reactive data:

```typescript
// Example: Collection service with Zustand
export interface CollectionStore {
  collections: Collection[];
  currentCollection: Collection | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchCollections: () => Promise<void>;
  selectCollection: (id: string) => Promise<void>;
  createCollection: (data: CreateCollectionRequest) => Promise<void>;
}
```

### Data Flow

1. **Component** triggers action
2. **Store** calls service method
3. **Service** makes API request
4. **Service** transforms response
5. **Store** updates state
6. **Component** re-renders

## Error Handling

### Standardized Error Creation

Errors from HTTP calls are standardized via the `createApiError` function in `src/lib/api/client.ts`. Services should catch axios errors and throw the result of `createApiError(error)` for consistent messages in UI components.

```typescript
// src/lib/api/client.ts
export const createApiError = (error: any): Error => {
  if (error.response) {
    return new Error(error.response.data?.message || `API Error: ${error.response.status}`);
  }
  if (error.request) {
    return new Error('Network Error: No response from server');
  }
  return new Error(error.message || 'Unknown API Error');
};
```

### Retry Logic

```typescript
// Services implement exponential backoff for transient errors
const retryableErrors = [408, 429, 500, 502, 503, 504];

export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  // Implementation with exponential backoff
}
```

## Authentication & Authorization

### Service Interface

```typescript
// src/services/auth/types.ts
export interface AuthService {
  // Core authentication
  signIn(credentials: SignInRequest): Promise<AuthResult>;
  signOut(): Promise<void>;
  refreshToken(): Promise<AuthResult>;
  
  // User management
  getCurrentUser(): Promise<User>;
  updateProfile(data: UpdateProfileRequest): Promise<User>;
  
  // Token management
  getAccessToken(): string | null;
  isAuthenticated(): boolean;
  
  // Authorization
  hasPermission(permission: string): boolean;
  hasRole(role: string): boolean;
}
```

### Provider Pattern

Authentication uses a provider pattern for easy swapping:

```typescript
// src/services/auth/providers/
├── azure-ad-b2c.ts    # Azure AD B2C implementation
├── auth0.ts           # Auth0 implementation
├── custom.ts          # Custom backend implementation
└── mock.ts            # Development/testing mock
```

### Integration Points

1. **HTTP Interceptors**: Automatic token attachment
2. **Route Guards**: Protect authenticated routes
3. **Error Handling**: Handle 401/403 responses
4. **State Sync**: Keep auth state synchronized

## Data Transformation

### Response Transformation

Services transform API responses to domain models:

```typescript
// src/services/collections/transforms.ts
export function transformCollectionResponse(
  response: CollectionApiResponse
): Collection {
  return {
    id: response.collection_id,
    name: response.display_name,
    documentCount: response.document_count,
    createdAt: new Date(response.created_timestamp),
    // ... other transformations
  };
}
```

### Request Transformation

Domain models are transformed to API requests:

```typescript
export function transformCreateCollectionRequest(
  data: CreateCollectionData
): CreateCollectionApiRequest {
  return {
    display_name: data.name,
    description: data.description,
    source_config: data.sourceConfiguration,
    // ... other transformations
  };
}
```

## Testing API Services

### Service Testing

Unit tests for each feature’s API take place alongside the service files under `src/features/[domain]/api/__tests__/`:

```typescript
// src/features/collections/api/__tests__/collections.service.test.ts
import { fetchCollections } from '../collections.service';

describe('CollectionsService', () => {
  it('should fetch a list of collections', async () => {
    // mock apiClient and verify response mapping
  });
});
```

### Integration Testing

```typescript
// e2e-tests/api-integration.spec.ts
test('complete workflow: authenticate -> create collection -> generate QA pairs', async () => {
  // Test full API workflow with real backend
});
```

### Mocking Strategies

1. **Development**: Mock entire services for frontend-only development
2. **Testing**: Mock HTTP client for unit tests
3. **E2E**: Use test database with real API
4. **Storybook**: Mock services for component stories

## Extension Points

### Adding New Services

1. Create service interface in `src/services/[domain]/types.ts`
2. Implement service in `src/services/[domain]/service.ts`
3. Add store integration in `src/stores/[domain].ts`
4. Export from `src/services/index.ts`

### Custom API Providers

1. Implement the required service interface
2. Add provider configuration
3. Update service factory
4. Add environment configuration

### Error Handling Extensions

1. Add custom error types
2. Implement error transformers
3. Add UI error components
4. Update error boundary logic

## Best Practices

### Performance

- Use React Query or SWR for caching
- Implement request deduplication
- Add loading states and skeleton UIs
- Optimize bundle size with code splitting

### Security

- Never store sensitive data in localStorage
- Implement proper CSRF protection
- Validate all API responses
- Use HTTPS in production

### Developer Experience

- Provide TypeScript definitions for all APIs
- Include comprehensive error messages
- Add development tools and debugging
- Document all configuration options

## Configuration Examples

### Environment Variables

```bash
# .env.development
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_AUTH_PROVIDER=mock
REACT_APP_LOG_LEVEL=debug

# .env.production
REACT_APP_API_BASE_URL=https://api.yourdomain.com
REACT_APP_AUTH_PROVIDER=azure-ad-b2c
REACT_APP_LOG_LEVEL=error
```

### Service Configuration

```typescript
// src/config/services.ts
export const serviceConfig = {
  auth: {
    provider: process.env.REACT_APP_AUTH_PROVIDER || 'custom',
    azureAdB2C: {
      clientId: process.env.REACT_APP_AZURE_CLIENT_ID,
      tenantId: process.env.REACT_APP_AZURE_TENANT_ID,
      // ... other Azure config
    },
    // ... other provider configs
  },
  api: {
    retries: 3,
    timeout: 30000,
    // ... other API config
  }
};
```

This service layer design ensures that your frontend is extensible, maintainable, and provides a great developer experience for teams that need to customize authentication or other integrations.
