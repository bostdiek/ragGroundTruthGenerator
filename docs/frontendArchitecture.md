# Frontend Architecture

This document describes the architecture and design decisions for the AI Ground Truth Generator frontend, built with React and TypeScript.

## Overview

The frontend is a React application that implements a **complete, working ground truth generation workflow** - you can run it today with demo data and immediately see the full pipeline from question input to exportable Q&A pairs.

The architecture is designed to be extensible and customizable, particularly around authentication and data source integration, while providing a solid foundation that works out of the box.

### The Working Workflow

The application implements these core workflow steps:

1. **Authentication** - Currently demo auth, ready for production providers
2. **Collection Creation** - Organize related questions and documents
3. **Question Management** - Add and track questions through the pipeline
4. **Document Retrieval** - Automatically find relevant source documents
5. **Answer Generation** - AI-powered answer creation from retrieved documents
6. **Human Review** - Approve, revise, or provide feedback on generated answers
7. **Export** - Download approved Q&A pairs for data science teams

This gives teams an **immediate starting point** that they can extend with their own authentication, data sources, and AI models.

## Technology Stack

- **React 18** with TypeScript for type safety
- **Zustand** for state management
- **React Router** for navigation
- **Axios** for HTTP client
- **Create React App (react-scripts)** for build tooling
- **Vitest** and **Playwright** for testing

## Project Structure

```text
src/
├── components/        # Reusable UI components
├── config/            # Application configuration (api, auth, features, ui)
├── lib/               # Core utilities and providers
│   ├── api/           # Axios API client and interceptors
│   └── query.ts       # React Query provider setup
├── features/          # Feature-specific modules
│   ├── auth/          # Authentication components, hooks, API
│   ├── collections/   # Collection management pages, stores, and API
│   ├── retrieval/     # Document retrieval pages, stores, and API
│   └── generation/    # Answer generation pages, stores, and API
├── providers/         # React context providers (AuthProvider, CollectionsProvider)
├── stores/            # Zustand state stores
├── types/             # TypeScript type definitions
└── styles/            # Global styles and themes
```

## Architecture Patterns

### Feature-Based Organization

The application is organized by features rather than technical layers. Each feature contains:

- Components specific to that feature
- Custom hooks for feature logic
- Types and interfaces
- API service methods (when feature-specific)

Example feature structure:
```text
src/features/auth/
├── components/
│   ├── LoginForm.tsx
│   └── ProtectedRoute.tsx
├── hooks/
│   └── useAuth.tsx
├── types/
│   └── authTypes.ts
└── api/
    └── authService.ts
```

### State Management Strategy

The application uses **Zustand** for state management with the following principles:

1. **Feature-specific stores**: Each major feature has its own store
2. **Minimal global state**: Only truly shared state is global
3. **Derived state**: Computed values are derived rather than stored
4. **Type safety**: All stores are fully typed

Store pattern:
```typescript
interface FeatureStore {
  // State
  data: FeatureData[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchData: () => Promise<void>;
  updateData: (data: FeatureData) => void;
  reset: () => void;
}
```

### Component Architecture

The application follows these component patterns:

1. **Functional Components**: All components use React hooks
2. **Composition over Inheritance**: Components are composed rather than extended
3. **Container/Presenter Pattern**: Logic is separated from presentation
4. **Custom Hooks**: Reusable logic is extracted into custom hooks

## Key Architectural Decisions

### Authentication Architecture

**Design Decision**: Provider-based authentication system designed for extensibility
- **Rationale**: Teams need flexibility to integrate with different auth providers
- **Current State**: Demo authentication with hardcoded users, designed for easy extension
- **Implementation**: Abstract auth interface ready for concrete provider implementations
- **Extension Point**: New auth providers can be added by implementing the provider interface

### API Layer Design

**Design Decision**: Centralized API client with feature-specific services
- **Rationale**: Consistent error handling, request/response transformation, and auth token management
- **Implementation**: Base API client with feature-specific service classes
- **Extension Point**: New APIs can be added by extending the base service class

### Error Handling Strategy

**Design Decision**: Centralized error handling with feature-specific recovery
- **Rationale**: Consistent user experience across the application
- **Implementation**: Global error boundary with feature-specific error handling
- **Extension Point**: Custom error types and handlers can be added per feature

### Routing Strategy

**Design Decision**: Nested routing with feature-based organization
- **Rationale**: Scalable routing that matches feature organization
- **Implementation**: React Router with nested route definitions
- **Extension Point**: New features can add their own route modules

## Data Flow

### Request/Response Flow

1. **User Action** → Component event handler
2. **Component** → Custom hook or direct store action
3. **Store Action** → API service call
4. **API Service** → HTTP request via API client
5. **Response** → Store state update
6. **State Update** → Component re-render

### Authentication Flow

1. **Login Attempt** → Demo auth service validates against hardcoded users
2. **Success** → JWT token returned from backend and stored in frontend
3. **API Requests** → Automatic token attachment via HTTP interceptors
4. **Token Refresh** → Backend handles token validation (no refresh implemented yet)
5. **Logout/Expiry** → Token cleanup and redirect to login

**Current Demo Users:**

- Username: `demo`, Password: `password` (contributor role)
- Username: `admin`, Password: `admin123` (admin role)

## Extension Points

### Adding New Authentication Providers

The auth system is designed to support multiple providers but currently only implements demo authentication. To add a new provider:

1. Create the provider interface (not yet implemented)
2. Implement the `AuthProvider` interface for your provider
3. Update the auth factory to include your provider
4. Configure environment variables for your provider
5. Update the auth service to use the provider factory

Example structure for future implementation:
2. Add provider configuration
3. Update the auth factory
4. Configure environment variables

### Adding New Features

To add a new feature:

1. Create feature directory in `src/features/`
2. Implement feature components and hooks
3. Create feature-specific store
4. Add API service methods
5. Define TypeScript types
6. Add routing configuration

### Customizing the UI Theme

The application supports theming through:

1. CSS custom properties for colors and spacing
2. Component-level style overrides
3. Global style configurations

### Adding New API Integrations

To integrate with new backends:

1. Extend the base API service
2. Add new endpoint methods
3. Define request/response types
4. Configure base URLs and auth

## Performance Considerations

### Code Splitting

- Features are lazily loaded using React.lazy()
- Routes are split at the feature level
- Large dependencies are dynamically imported

### State Management

- Stores are optimized to prevent unnecessary re-renders
- Selectors are used to subscribe to specific state slices
- Actions are batched when possible

### Caching Strategy

- API responses are cached in stores
- Static assets are cached by the browser
- Authentication tokens are cached securely

## Security Considerations

### Authentication Security

- Tokens are stored securely (httpOnly cookies preferred)
- Automatic token refresh prevents exposure
- Protected routes require valid authentication

### API Security

- All requests include authentication headers
- CORS is configured for the backend domain
- Request/response data is validated

### XSS Prevention

- All user input is sanitized
- Content Security Policy headers are configured
- React's built-in XSS protection is utilized

## Testing Strategy

### Unit Testing

- Components are tested with Vitest and React Testing Library
- Custom hooks are tested in isolation
- Stores are tested with mock actions

### Integration Testing

- API services are tested with mock backends
- Authentication flows are tested end-to-end
- Feature interactions are tested

### E2E Testing

- Critical user journeys are tested with Playwright
- Authentication and authorization are verified
- Cross-browser compatibility is ensured

## Development Workflow

### Local Development

1. Start the backend services
2. Configure environment variables
3. Run `npm run dev` for development server
4. Use browser dev tools for debugging

### Building and Deployment

1. Run `npm run build` to create production build
2. Static files are generated in `build/` directory
3. Deploy to any static hosting service
4. Configure environment variables for production

## Future Considerations

### Scalability

- Component library for design system consistency
- Micro-frontend architecture for large teams
- Advanced state management for complex workflows

### Accessibility

- ARIA labels and semantic HTML
- Keyboard navigation support
- Screen reader compatibility

### Internationalization

- React-i18next for translations
- Date/time localization
- RTL language support

This architecture provides a solid foundation while maintaining flexibility for teams to customize and extend the application according to their specific needs.
