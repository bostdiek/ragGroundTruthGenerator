# AI Ground Truth Generator - Frontend

![AI Ground Truth Generator Logo](public/logo192.png)

**A complete working example** of an AI ground truth generation workflow that you can run immediately and extend for your team's needs.

## What You Get: End-to-End Ground Truth Workflow

This React application implements a **full ground truth generation pipeline** with these core capabilities:

### 📋 Collection Management

- Create collections to organize your ground truth work
- Manage sets of related questions and documents

### ❓ Question Handling

- Add questions you need ground truth answers for
- Track question status through the workflow

### 📄 Document Retrieval

- Automatically retrieve relevant source documents for each question
- Support for extensible data source providers

### 🤖 AI Answer Generation

- Generate initial answers using configurable AI models
- Built-in integration with Azure OpenAI and extensible for other providers

### ✅ Human Review Process

- Review generated answers with approve/revise/feedback workflow
- Quality control before finalizing ground truth data

### 📤 Export for Data Science

- Export approved Q&A pairs in formats ready for model training
- Integration-ready outputs for your ML pipeline

This is a **minimal but complete implementation** - you can run it locally with demo data today, then extend it with your authentication, data sources, and AI models.

## Quick Start

```bash
# Install dependencies
npm install

# Create environment file
# Copy and edit a local .env file at the project root or in frontend/ as needed
# Define REACT_APP_API_URL, REACT_APP_AUTH_PROVIDER, etc.

# Start development server
npm start

# Run tests
npm test
```

The application will be available at `http://localhost:3000`.

## The Workflow in Action

Once running, you'll see the complete ground truth generation workflow:

1. **Login** - Use the demo authentication (username: `demo`, any password)
2. **Create a Collection** - Start organizing your ground truth work
3. **Add Questions** - Input questions you need answered
4. **Retrieve Documents** - System fetches relevant source materials
5. **Generate Answers** - AI creates initial answers from the documents
6. **Review & Approve** - Human reviewers validate and improve the answers
7. **Export Results** - Download approved Q&A pairs for your data science team

This gives you a **working foundation** that your team can immediately use and then customize with your own authentication, data sources, and AI models.

## Architecture Overview

This frontend application follows a **modular, provider-based architecture** designed for extensibility and developer productivity:

- **🔐 Extensible Authentication**: Currently implements demo authentication with a provider-based architecture ready for Azure AD B2C, Auth0, or custom backends
- **📊 State Management**: Zustand stores with TypeScript for predictable state updates
- **🛡️ Type Safety**: End-to-end TypeScript with comprehensive API types
- **🧪 Testing First**: Unit, integration, and E2E testing with modern tooling
- **🎨 Component Library**: Styled Components with reusable UI patterns
- **🔄 API Layer**: Service pattern with automatic error handling and retries

### Key Features

- **Collection Management**: Create and manage document collections
- **Answer Generation**: AI-powered Q&A pair generation with multiple models
- **Document Retrieval**: Extensible document source integration
- **Role-Based Access**: Granular permissions and role management
- **Real-time Updates**: Live status updates and progress tracking

## Configuration

### Environment Variables

```bash
# Core Configuration
REACT_APP_API_URL=http://localhost:8000
REACT_APP_AUTH_PROVIDER=demo  # Currently only 'demo' is implemented

# Ready for future providers:
# REACT_APP_AUTH_PROVIDER=azure-ad-b2c | auth0 | custom

# Azure AD B2C (when implemented)
# REACT_APP_AZURE_CLIENT_ID=your-client-id
# REACT_APP_AZURE_TENANT_ID=your-tenant-id
# REACT_APP_AZURE_POLICY_NAME=B2C_1_signupsignin

# Auth0 (when implemented)
# REACT_APP_AUTH0_DOMAIN=your-domain.auth0.com
# REACT_APP_AUTH0_CLIENT_ID=your-client-id

# Custom Auth (when implemented)
# REACT_APP_CUSTOM_AUTH_URL=https://your-auth-service.com

# Feature Flags
REACT_APP_ENABLE_ADVANCED_FEATURES=true
REACT_APP_LOG_LEVEL=info
```

### Authentication Providers

The application currently implements demo authentication but is designed with a provider-based architecture for easy extension:

- **Demo Provider** (current): Simple hardcoded users for development and testing
- **Provider Architecture**: Ready for Azure AD B2C, Auth0, or custom backend integration
- **Extension Points**: Clear interfaces and patterns for adding new providers

The authentication system is designed for easy provider swapping once additional providers are implemented.

## Development

### Project Structure

```text
src/
├── components/        # Reusable UI components
├── config/            # Application configuration (api, auth, features, ui)
├── lib/               # Core utilities and providers
│   ├── api/           # Axios API client and interceptors
│   └── react-query/   # React Query provider setup
├── features/          # Feature-specific modules (UI, state, API)
│   ├── auth/          # Authentication components, hooks, API
│   ├── collections/   # Collection management (pages, stores, API)
│   ├── retrieval/     # Document retrieval (pages, stores, API)
│   └── generation/    # Answer generation (pages, stores, API)
├── providers/         # React context providers (AuthProvider, CollectionsProvider)
├── stores/            # Zustand state stores
├── types/             # TypeScript type definitions
├── utils/             # Utility functions and helpers
└── styles/            # Global styles and themes
```

### Available Scripts

```bash
# Development
npm start              # Start development server
npm test               # Run unit tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Generate coverage report

# Code Quality
npm run lint           # Check code style
npm run lint:fix       # Fix linting issues
npm run format         # Format code with Prettier

# Testing
npm run e2e            # Run E2E tests with Playwright
npm run e2e:ui         # Run E2E tests with UI

# Production
npm run build          # Build for production
```

### Adding Features

The application is designed for easy extension. To add a new feature:

1. Create a feature module in `src/features/my-feature/`
2. Implement the service layer for API integration
3. Create Zustand stores for state management
4. Build React components with TypeScript
5. Add routing and navigation
6. Write comprehensive tests

See `/docs/frontendExtensions.md` for detailed guidance.

## Authentication Extension

### Current Implementation

The application currently uses a demo authentication provider with these test users:

- Username: `demo`, Password: `password` (contributor role)
- Username: `admin`, Password: `admin123` (admin role)

### Adding Authentication Providers

The authentication system uses a provider pattern designed for easy extension. To add a new provider:

```typescript
// 1. Set environment variable
REACT_APP_AUTH_PROVIDER=my-provider

// 2. Implement AuthService interface
export class MyAuthProvider implements AuthService {
  async signIn(credentials: SignInRequest): Promise<AuthResult> {
    // Your authentication logic
  }
  // ... other required methods
}

// 3. Register in auth factory
export function createAuthService(): AuthService {
  switch (authConfig.provider) {
    case 'my-provider':
      return new MyAuthProvider(authConfig.myProvider);
    // ... other providers
  }
}
```

### Custom Authentication Example

```typescript
// For custom backend authentication
export class CustomAuthProvider implements AuthService {
  async signIn({ email, password }: SignInRequest): Promise<AuthResult> {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const { user, token } = await response.json();
      this.storeToken(token);
      return { success: true, user, accessToken: token };
    }

    return { success: false, error: 'Invalid credentials' };
  }
}
```

## Testing

### Test Structure

```text
src/
├── __tests__/           # Global test utilities
├── features/*/          # Feature-specific tests
│   ├── __tests__/       # Unit tests
│   └── components/
│       └── *.test.tsx   # Component tests
└── testing/             # Test utilities and mocks
```

### Test Types

- **Unit Tests**: Individual functions and components (Vitest + Testing Library)
- **Integration Tests**: Feature workflows and API integration
- **E2E Tests**: Complete user journeys (Playwright)

### Running Tests

```bash
# Unit and integration tests
npm test                    # Run once
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage

# E2E tests
npm run e2e                # Headless
npm run e2e:ui             # With browser UI
```

## Deployment

### Docker

```bash
# Build image
docker build -t ai-ground-truth-frontend .

# Run container
docker run -p 3000:3000 ai-ground-truth-frontend
```

### Production Build

```bash
# Build optimized bundle
npm run build

# Serve static files
# Deploy build/ directory to your hosting provider
```

### Environment-Specific Builds

```bash
# Development build
REACT_APP_ENV=development npm run build

# Staging build
REACT_APP_ENV=staging npm run build

# Production build
REACT_APP_ENV=production npm run build
```

## Documentation

### Detailed Documentation

- **[Frontend Architecture](../docs/frontendArchitecture.md)**: Comprehensive architecture overview, patterns, and design principles
- **[Frontend APIs](../docs/frontendAPIs.md)**: Service layer, API integration, and state management
- **[Frontend Extensions](../docs/frontendExtensions.md)**: Step-by-step guide for customizing authentication and adding features

### API Integration

The frontend communicates with the FastAPI backend through a typed service layer:

```typescript
// Type-safe API calls
const collections = await collectionService.getCollections();
const result = await generationService.generateQAPairs({
  collectionId: 'collection-123',
  count: 10,
  model: 'gpt-4'
});
```

### State Management

Uses Zustand for simple, TypeScript-friendly state management:

```typescript
// Access state and actions
const { collections, loading, fetchCollections } = useCollectionStore();

// Update state
await fetchCollections();
```

## Security Considerations

- **Token Storage**: Uses secure token storage practices
- **CSRF Protection**: Implements proper CSRF tokens for state-changing operations
- **Input Validation**: Client-side validation with server-side verification
- **Error Handling**: Secure error messages that don't leak sensitive information

## Performance

- **Code Splitting**: Automatic route-based code splitting
- **Bundle Analysis**: Use `npm run build` to analyze bundle size
- **Caching**: API responses cached with React Query
- **Lazy Loading**: Components and routes loaded on demand

## Troubleshooting

### Common Issues

**Authentication not working**: Check environment variables and provider configuration
**API calls failing**: Verify `REACT_APP_API_URL` and backend connectivity  
**Build errors**: Ensure all dependencies are installed with `npm install`
**Type errors**: Run `npm run lint` to check for TypeScript issues

### Development Tools

- **React Developer Tools**: Browser extension for React debugging
- **Redux DevTools**: For state inspection (if using Redux)
- **Network Tab**: Monitor API calls and responses
- **Console Logging**: Controlled by `REACT_APP_LOG_LEVEL`

## Contributing

1. Follow the established TypeScript and React patterns
2. Write tests for new features and components
3. Update documentation for any architectural changes
4. Use the provided ESLint and Prettier configurations
5. Ensure all tests pass before submitting changes

The frontend is designed to be **extensible by default**—whether you're swapping authentication providers, adding new features, or integrating with different APIs, the modular architecture makes it straightforward to customize while maintaining code quality and consistency.
