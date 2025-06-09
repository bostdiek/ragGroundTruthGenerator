# Frontend Extensions Guide

This guide provides detailed instructions for extending and customizing the frontend application, with special focus on authentication providers and adding new features.

## Table of Contents

- [Quick Start for Extensions](#quick-start-for-extensions)
- [Authentication Provider Extensions](#authentication-provider-extensions)
- [Adding New Features](#adding-new-features)
- [UI Component Extensions](#ui-component-extensions)
- [State Management Extensions](#state-management-extensions)
- [Routing and Navigation](#routing-and-navigation)
- [Testing Your Extensions](#testing-your-extensions)
- [Deployment Considerations](#deployment-considerations)

## Quick Start for Extensions

### Prerequisites

1. Node.js 18+ and npm/yarn
2. Understanding of React, TypeScript, and your chosen state management
3. Familiarity with the project's architecture (see `frontendArchitecture.md`)

### Setting Up Development

```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

### Extension Checklist

- [ ] Read the architecture documentation
- [ ] Identify extension points
- [ ] Follow TypeScript patterns
- [ ] Add comprehensive tests
- [ ] Update documentation
- [ ] Validate with existing features

## Authentication Provider Extensions

The authentication system is designed for easy provider swapping. Here's how to add or customize authentication.

### Current Providers

The authentication system uses a provider pattern with the core demo provider out of the box. Code locations:

```text
src/features/auth/
├── api/
│   └── authService.ts     # Demo auth API (login, logout, profile)
├── stores/
│   └── authStore.ts       # Zustand store for auth state
└── types/
    └── authTypes.ts       # Auth request and response types
```

To add new providers, create an `providers/` folder under `src/features/auth/` and implement your provider there:

### Adding a New Authentication Provider

The current architecture is ready for multiple providers. Here's how to implement a new one:

#### Step 1: Create the Provider Interface

First, you'll need to create the provider interface that the current auth service will implement:

```typescript
// src/features/auth/providers/types.ts (new file)
export interface AuthProvider {
  signIn(credentials: SignInRequest): Promise<AuthResult>;
  signOut(): Promise<void>;
  refreshToken(): Promise<AuthResult>;
  getCurrentUser(): Promise<User>;
  getAccessToken(): string | null;
  isAuthenticated(): boolean;
  hasPermission(permission: string): boolean;
  hasRole(role: string): boolean;
}

export interface SignInRequest {
  username?: string;
  email?: string;
  password?: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
}
```

#### Step 2: Implement Your Provider

```typescript
// src/features/auth/providers/my-provider.ts (new file)
import { AuthProvider, User, SignInRequest, AuthResult } from './types';

export class MyAuthProvider implements AuthProvider {
  private accessToken: string | null = null;
  private user: User | null = null;

  async signIn(credentials: SignInRequest): Promise<AuthResult> {
    try {
      // Implement your authentication logic
      const response = await this.authenticateWithProvider(credentials);
      
      this.accessToken = response.access_token;
      this.user = response.user;
      
      // Store tokens securely
      this.storeTokens(response);
      
      return {
        success: true,
        user: response.user,
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleAuthError(error),
      };
    }
  }

  async signOut(): Promise<void> {
    // Clear tokens and user data
    this.accessToken = null;
    this.user = null;
    this.clearStoredTokens();
    
    // Call provider logout if needed
    await this.logoutFromProvider();
  }

  async refreshToken(): Promise<AuthResult> {
    // Implement token refresh logic
    // Return new tokens or trigger re-authentication
  }

  async getCurrentUser(): Promise<User> {
    if (!this.user) {
      // Fetch user from stored token or API
      this.user = await this.fetchUserFromToken();
    }
    return this.user;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken && !this.isTokenExpired();
  }

  hasPermission(permission: string): boolean {
    // Implement permission checking logic
    return this.user?.permissions?.includes(permission) ?? false;
  }

  hasRole(role: string): boolean {
    // Implement role checking logic
    return this.user?.roles?.includes(role) ?? false;
  }

  // Private helper methods
  private async authenticateWithProvider(credentials: SignInRequest) {
    // Your provider-specific authentication
  }

  private storeTokens(tokens: any) {
    // Store tokens securely (consider using secure storage)
    sessionStorage.setItem('access_token', tokens.access_token);
    sessionStorage.setItem('refresh_token', tokens.refresh_token);
  }

  private clearStoredTokens() {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
  }

  private isTokenExpired(): boolean {
    // Check if current token is expired
    // Implement based on your token format (JWT, etc.)
  }
}
```

#### Step 3: Update Configuration and Factory

```typescript
// src/features/auth/config.ts (new file)
export interface AuthConfig {
  provider: 'demo' | 'azure-ad-b2c' | 'auth0' | 'custom' | 'my-provider';
  myProvider?: {
    apiUrl: string;
    clientId: string;
    redirectUri: string;
    scopes: string[];
  };
  // ... other provider configs
}

export const authConfig: AuthConfig = {
  provider: (process.env.REACT_APP_AUTH_PROVIDER as any) || 'demo',
  myProvider: {
    apiUrl: process.env.REACT_APP_MY_PROVIDER_API_URL || '',
    clientId: process.env.REACT_APP_MY_PROVIDER_CLIENT_ID || '',
    redirectUri: process.env.REACT_APP_MY_PROVIDER_REDIRECT_URI || '',
    scopes: ['openid', 'profile', 'email'],
  },
};
```

```typescript
// src/features/auth/factory.ts (new file)
import { AuthProvider } from './providers/types';
import { DemoAuthProvider } from './providers/demo'; // Current implementation
import { MyAuthProvider } from './providers/my-provider';
import { authConfig } from './config';

export function createAuthProvider(): AuthProvider {
  const { provider } = authConfig;

  switch (provider) {
    case 'demo':
      return new DemoAuthProvider();
    case 'my-provider':
      return new MyAuthProvider(authConfig.myProvider!);
    // Add other providers as implemented
    default:
      throw new Error(`Unknown auth provider: ${provider}`);
  }
}
```

#### Step 4: Update Environment Configuration

```bash
# .env.local or .env.production
REACT_APP_AUTH_PROVIDER=my-provider
REACT_APP_MY_PROVIDER_API_URL=https://auth.myprovider.com
REACT_APP_MY_PROVIDER_CLIENT_ID=your-client-id
REACT_APP_MY_PROVIDER_REDIRECT_URI=http://localhost:3000/auth/callback
```

#### Step 5: Integrate with Current Auth System

```typescript
// Update src/features/auth/api/authService.ts to use provider factory
import { createAuthProvider } from '../factory';

const authProvider = createAuthProvider();

export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const result = await authProvider.signIn(credentials);
  if (result.success) {
    return {
      access_token: result.accessToken!,
      token_type: 'bearer',
      user: result.user!,
    };
  }
  throw new Error(result.error || 'Authentication failed');
};

// Update other auth functions similarly...
```

```typescript
// src/components/auth/SignInForm.tsx
export function SignInForm() {
  const { authProvider } = useAuth();

  // Render different UI based on provider
  if (authProvider === 'my-provider') {
    return <MyProviderSignIn />;
  }

  // Default sign-in form
  return <DefaultSignInForm />;
}
```

### OAuth/OIDC Provider Example

For OAuth providers, you might implement a redirect-based flow:

```typescript
// src/services/auth/providers/oauth-provider.ts
export class OAuthProvider implements AuthService {
  async signIn(): Promise<AuthResult> {
    // Redirect to OAuth provider
    const authUrl = this.buildAuthUrl();
    window.location.href = authUrl;
    
    // This won't return immediately - handled by callback
    return { success: false, error: 'Redirecting...' };
  }

  async handleCallback(code: string): Promise<AuthResult> {
    // Exchange code for tokens
    const tokens = await this.exchangeCodeForTokens(code);
    // Store tokens and get user info
    return this.completeAuthentication(tokens);
  }

  private buildAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: 'code',
      scope: this.config.scopes.join(' '),
      redirect_uri: this.config.redirectUri,
      state: this.generateState(), // CSRF protection
    });

    return `${this.config.authUrl}?${params.toString()}`;
  }
}
```

## Adding New Features

### Feature Structure

```typescript
src/features/my-feature/
├── components/           # React components
│   ├── MyFeatureList.tsx
│   ├── MyFeatureForm.tsx
│   └── index.ts
├── hooks/               # Custom hooks
│   ├── useMyFeature.ts
│   └── index.ts
├── services/            # API services
│   ├── my-feature.service.ts
│   └── types.ts
├── stores/              # State management
│   ├── my-feature.store.ts
│   └── index.ts
├── types/               # TypeScript types
│   └── index.ts
└── index.ts             # Feature exports
```

### Step-by-Step Feature Addition

#### Step 1: Define Types

```typescript
// src/features/my-feature/types/index.ts
export interface MyFeature {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMyFeatureRequest {
  name: string;
  description: string;
}

export interface UpdateMyFeatureRequest extends Partial<CreateMyFeatureRequest> {
  id: string;
}
```

#### Step 2: Create Service

```typescript
// src/features/my-feature/services/my-feature.service.ts
import { ApiClient } from '../../../services/api/client';
import { MyFeature, CreateMyFeatureRequest } from '../types';

export class MyFeatureService {
  constructor(private apiClient: ApiClient) {}

  async getAll(): Promise<MyFeature[]> {
    const response = await this.apiClient.get<MyFeature[]>('/my-features');
    return response.map(this.transformResponse);
  }

  async create(data: CreateMyFeatureRequest): Promise<MyFeature> {
    const response = await this.apiClient.post<MyFeature>('/my-features', data);
    return this.transformResponse(response);
  }

  private transformResponse(item: any): MyFeature {
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
    };
  }
}
```

#### Step 3: Create Store

```typescript
// src/features/my-feature/stores/my-feature.store.ts
import { create } from 'zustand';
import { MyFeature, CreateMyFeatureRequest } from '../types';
import { MyFeatureService } from '../services/my-feature.service';

interface MyFeatureStore {
  features: MyFeature[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchFeatures: () => Promise<void>;
  createFeature: (data: CreateMyFeatureRequest) => Promise<void>;
  clearError: () => void;
}

export const useMyFeatureStore = create<MyFeatureStore>((set, get) => ({
  features: [],
  loading: false,
  error: null,

  fetchFeatures: async () => {
    set({ loading: true, error: null });
    try {
      const features = await myFeatureService.getAll();
      set({ features, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createFeature: async (data) => {
    set({ loading: true, error: null });
    try {
      const newFeature = await myFeatureService.create(data);
      set(state => ({
        features: [...state.features, newFeature],
        loading: false
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
```

#### Step 4: Create Components

```typescript
// src/features/my-feature/components/MyFeatureList.tsx
import React, { useEffect } from 'react';
import { useMyFeatureStore } from '../stores/my-feature.store';

export function MyFeatureList() {
  const { features, loading, error, fetchFeatures } = useMyFeatureStore();

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>My Features</h2>
      {features.map(feature => (
        <div key={feature.id}>
          <h3>{feature.name}</h3>
          <p>{feature.description}</p>
        </div>
      ))}
    </div>
  );
}
```

#### Step 5: Add Routing

```typescript
// src/App.tsx
import { MyFeatureList } from './features/my-feature/components';

function App() {
  return (
    <Routes>
      {/* Existing routes */}
      <Route path="/my-features" element={<MyFeatureList />} />
    </Routes>
  );
}
```

## UI Component Extensions

### Component Library Integration

The project uses a component library approach. To add new components:

```typescript
// src/components/ui/my-component/MyComponent.tsx
import React from 'react';
import { BaseComponentProps } from '../types';

export interface MyComponentProps extends BaseComponentProps {
  title: string;
  onAction?: () => void;
}

export function MyComponent({ title, onAction, className, ...props }: MyComponentProps) {
  return (
    <div className={`my-component ${className}`} {...props}>
      <h3>{title}</h3>
      {onAction && (
        <button onClick={onAction}>Action</button>
      )}
    </div>
  );
}
```

### Styling Extensions

The project supports multiple styling approaches:

```typescript
// CSS Modules approach
import styles from './MyComponent.module.css';

export function MyComponent() {
  return <div className={styles.container}>Content</div>;
}
```

```typescript
// Styled Components approach (if using styled-components)
import styled from 'styled-components';

const Container = styled.div`
  padding: 1rem;
  background: ${props => props.theme.colors.background};
`;

export function MyComponent() {
  return <Container>Content</Container>;
}
```

## State Management Extensions

### Adding New Stores

Follow the established patterns:

```typescript
// src/stores/my-domain.store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface MyDomainStore {
  // State
  items: MyItem[];
  selectedItem: MyItem | null;
  
  // Actions
  setItems: (items: MyItem[]) => void;
  selectItem: (item: MyItem) => void;
}

export const useMyDomainStore = create<MyDomainStore>()(
  devtools(
    (set) => ({
      items: [],
      selectedItem: null,
      
      setItems: (items) => set({ items }),
      selectItem: (selectedItem) => set({ selectedItem }),
    }),
    { name: 'my-domain-store' }
  )
);
```

### Cross-Store Communication

```typescript
// src/stores/orchestrator.ts
export function useOrchestrator() {
  const authStore = useAuthStore();
  const collectionStore = useCollectionStore();
  
  const handleUserSignOut = () => {
    authStore.signOut();
    collectionStore.clearCollections();
    // Clear other stores as needed
  };
  
  return { handleUserSignOut };
}
```

## Routing and Navigation

### Adding Protected Routes

```typescript
// src/components/routing/ProtectedRoute.tsx
export function ProtectedRoute({ 
  children, 
  requiredPermission 
}: { 
  children: React.ReactNode;
  requiredPermission?: string;
}) {
  const { isAuthenticated, hasPermission } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" />;
  }
  
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return <>{children}</>;
}
```

```typescript
// Usage in routing
<Route 
  path="/admin" 
  element={
    <ProtectedRoute requiredPermission="admin">
      <AdminDashboard />
    </ProtectedRoute>
  } 
/>
```

## Testing Your Extensions

### Unit Testing

```typescript
// src/features/my-feature/__tests__/my-feature.service.test.ts
import { MyFeatureService } from '../services/my-feature.service';
import { mockApiClient } from '../../../testing/mocks';

describe('MyFeatureService', () => {
  let service: MyFeatureService;

  beforeEach(() => {
    service = new MyFeatureService(mockApiClient);
    mockApiClient.reset();
  });

  it('should fetch all features', async () => {
    const mockResponse = [{ id: '1', name: 'Test', description: 'Test' }];
    mockApiClient.get.mockResolvedValue(mockResponse);

    const result = await service.getAll();

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Test');
  });
});
```

### Integration Testing

```typescript
// src/features/my-feature/__tests__/integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { MyFeatureList } from '../components/MyFeatureList';
import { TestProviders } from '../../../testing/providers';

test('displays features after loading', async () => {
  render(
    <TestProviders>
      <MyFeatureList />
    </TestProviders>
  );

  expect(screen.getByText('Loading...')).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText('Test Feature')).toBeInTheDocument();
  });
});
```

### E2E Testing

```typescript
// e2e-tests/my-feature.spec.ts
import { test, expect } from '@playwright/test';

test('user can create and view features', async ({ page }) => {
  await page.goto('/my-features');
  
  // Test feature creation
  await page.click('[data-testid=create-feature-button]');
  await page.fill('[data-testid=feature-name]', 'New Feature');
  await page.click('[data-testid=save-button]');
  
  // Verify feature appears in list
  await expect(page.locator('text=New Feature')).toBeVisible();
});
```

## Deployment Considerations

### Environment Configuration

```typescript
// src/config/environment.ts
export const environment = {
  production: process.env.NODE_ENV === 'production',
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  authProvider: process.env.REACT_APP_AUTH_PROVIDER || 'mock',
  logLevel: process.env.REACT_APP_LOG_LEVEL || 'info',
  features: {
    myFeature: process.env.REACT_APP_ENABLE_MY_FEATURE === 'true',
  },
};
```

### Feature Flags

```typescript
// src/lib/feature-flags.ts
export function useFeatureFlag(flag: string): boolean {
  return environment.features[flag] ?? false;
}

// Usage in components
export function MyFeatureComponent() {
  const isEnabled = useFeatureFlag('myFeature');
  
  if (!isEnabled) {
    return null;
  }
  
  return <div>My Feature Content</div>;
}
```

### Build Optimization

```json
// package.json
{
  "scripts": {
    "build:development": "REACT_APP_ENV=development npm run build",
    "build:staging": "REACT_APP_ENV=staging npm run build",
    "build:production": "REACT_APP_ENV=production npm run build"
  }
}
```

## Best Practices for Extensions

### Code Organization

- Keep related code together in feature folders
- Use consistent naming conventions
- Export everything through index files
- Follow the established TypeScript patterns

### Performance

- Implement lazy loading for large features
- Use React.memo for expensive components
- Optimize bundle size with tree shaking
- Consider using React Suspense for loading states

### Security

- Validate all user inputs
- Sanitize data before rendering
- Use proper error boundaries
- Follow authentication best practices

### Documentation

- Document all extension points
- Provide examples for common customizations
- Keep README files up to date
- Include inline code comments

This guide provides the foundation for extending the frontend application. The modular architecture and provider patterns make it easy to customize authentication and add new features while maintaining code quality and consistency.
