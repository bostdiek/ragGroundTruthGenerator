# Frontend Refactoring Plan

This document outlines our approach to refactoring the frontend of the AI Ground Truth Generator project, following the Bulletproof React principles. The plan consists of two main sections: a robust testing strategy and a detailed refactoring plan.

## Table of Contents

- [Frontend Refactoring Plan](#frontend-refactoring-plan)
  - [Table of Contents](#table-of-contents)
  - [Testing Strategy](#testing-strategy)
    - [Objectives](#objectives)
    - [Testing Layers](#testing-layers)
      - [1. Unit Tests](#1-unit-tests)
      - [2. Integration Tests](#2-integration-tests)
      - [3. E2E Tests](#3-e2e-tests)
    - [Test Architecture](#test-architecture)
    - [Implementation Approach](#implementation-approach)
    - [Testing Tools](#testing-tools)
  - [Refactoring Plan](#refactoring-plan)
    - [Project Structure](#project-structure)
    - [API Layer](#api-layer)
    - [State Management](#state-management)
    - [Components and Styling](#components-and-styling)
    - [Authentication and Security](#authentication-and-security)
    - [Performance Optimization](#performance-optimization)
    - [Implementation Phases](#implementation-phases)
      - [Phase 1: Setup and Infrastructure](#phase-1-setup-and-infrastructure)
      - [Phase 2: Core Features](#phase-2-core-features)
      - [Phase 3: Refinement and Optimization](#phase-3-refinement-and-optimization)
  - [Conclusion](#conclusion)

## Testing Strategy

### Objectives

1. **Resilience to Refactoring**: Tests should validate behavior, not implementation details, to ensure they remain valid during refactoring.
2. **Coverage Prioritization**: Focus on integration tests that verify crucial user flows, with selective unit tests for complex logic.
3. **API Boundary Testing**: Test interactions with backend endpoints without being tied to implementation specifics.
4. **Automated E2E Coverage**: Cover critical user journeys to ensure the application works correctly end-to-end.

### Testing Layers

#### 1. Unit Tests

- **Target**: Complex utility functions, hooks, and isolated component logic
- **Approach**: Focus on testing behavior, not implementation details
- **Examples**:
  - State transformations in utility functions
  - Custom hooks logic
  - Component render conditions (not DOM structure)

#### 2. Integration Tests

- **Target**: User flows, component interactions, API interactions
- **Approach**: Mock API responses, test interactions between components
- **Examples**:
  - Collection management flows
  - Authentication processes
  - Answer generation and submission

#### 3. E2E Tests

- **Target**: Critical user journeys through the entire application
- **Approach**: Automate real user interactions across multiple screens
- **Examples**:
  - User login → Create collection → Generate answer
  - Navigate between collections and manage QA pairs

### Test Architecture

To ensure tests remain valid during refactoring, we'll implement the following architecture:

1. **Page Object Model**:
   - Create abstractions for page interactions
   - Define high-level methods like `loginUser()` or `createCollection()`
   - Implementation can change while the API remains stable

2. **API Mocking Layer**:
   - Create a centralized mock server using MSW
   - Define expected API responses independent of UI implementation
   - Test that correct API calls are made with expected parameters

3. **Test Data Factories**:
   - Implement factories for generating test data
   - Allow tests to focus on relevant data while providing sensible defaults

### Implementation Approach

1. **Testing in Isolation**:
   - Test components with mocked dependencies
   - Focus on contract boundaries rather than internal implementation
   - Use data-testid attributes for querying elements

2. **Behavior-Driven Testing**:
   - Structure tests around user behavior (Given/When/Then)
   - Test what the user sees and can interact with
   - Avoid testing implementation details like state variables

3. **Contract Testing**:
   - Define contracts between frontend and backend
   - Test that frontend correctly interacts with these contracts
   - Use type checking to ensure contract adherence

### Testing Tools

We'll use the following tools to implement our testing strategy:

1. **Vitest**: Fast, modern test runner compatible with Jest API
2. **Testing Library**: Focus on testing from user perspective
3. **MSW (Mock Service Worker)**: API mocking at network level
4. **Playwright**: End-to-end testing with good cross-browser support
5. **Faker.js**: Generate realistic test data

## Refactoring Plan

### Project Structure

Following the Bulletproof React pattern, we'll restructure the frontend as follows:

```plaintext
src/
|-- app/               # Application layer (routes, providers)
|   |-- routes/        # Application routes definition
|   |-- app.tsx        # Main application component
|   |-- provider.tsx   # Global providers wrapper
|   |-- router.tsx     # Router configuration
|
|-- assets/            # Static assets
|
|-- components/        # Shared UI components
|   |-- ui/            # Basic UI elements (buttons, inputs, etc.)
|   |-- layout/        # Layout components
|   |-- form/          # Form-related components
|
|-- config/            # Configuration files
|
|-- features/          # Feature-based modules
|   |-- auth/          # Authentication feature
|   |-- collections/   # Collections management
|   |-- generation/    # Answer generation
|   |-- retrieval/     # Document retrieval
|
|-- hooks/             # Shared hooks
|
|-- lib/               # Reusable libraries
|   |-- api/           # API client
|   |-- storage/       # Storage utilities
|
|-- stores/            # Global state stores
|
|-- testing/           # Testing utilities
|   |-- mocks/         # Mock data and services
|   |-- utils/         # Test helper functions
|
|-- types/             # Shared TypeScript types
|
|-- utils/             # Utility functions
```

Each feature directory will have a consistent structure:

```plaintext
features/feature-name/
|-- api/              # API requests related to this feature
|-- components/       # Components specific to this feature
|-- hooks/            # Feature-specific hooks
|-- stores/           # Feature-specific state
|-- types/            # TypeScript types for this feature
|-- utils/            # Utility functions for this feature
```

### API Layer

We'll implement a robust API layer with the following structure:

1. **API Client**:
   - Create a single API client instance for the entire application
   - Implement request/response interceptors for auth tokens and error handling
   - Configure base URL and default headers

2. **Request Declarations**:
   - Define and export API request declarations in feature folders
   - Each declaration includes:
     - TypeScript types for request/response
     - Fetcher function using the API client
     - React Query hooks for data fetching and caching

3. **Error Handling**:
   - Implement centralized error handling for API requests
   - Create error boundary components
   - Define error types and handling strategies

Example implementation approach:

```typescript
// lib/api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// features/collections/api/get-collections.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Collection } from '@/features/collections/types';

export const getCollections = async (): Promise<Collection[]> => {
  const response = await apiClient.get('/collections');
  return response.data;
};

export const useCollections = () => {
  return useQuery({
    queryKey: ['collections'],
    queryFn: getCollections,
  });
};
```

### State Management

We'll implement a layered state management approach:

1. **Server Cache State**:
   - Use React Query for server data caching
   - Define query keys and invalidation strategies
   - Implement optimistic updates for mutations

2. **Application State**:
   - Use Zustand for global UI state
   - Create separate stores for different concerns (auth, UI, etc.)
   - Keep state minimal and focused

3. **Component State**:
   - Use React hooks (useState, useReducer) for component-specific state
   - Lift state up only when necessary

4. **Form State**:
   - Implement React Hook Form for form handling
   - Create reusable form components with validation

5. **URL State**:
   - Use React Router for routing and URL parameters
   - Leverage URL for shareable application state

### Components and Styling

1. **Component Library**:
   - Build a component library with reusable UI elements
   - Implement consistent styling and behavior
   - Create documentation for component usage

2. **Styling Solution**:
   - Use CSS modules for component styling
   - Implement a design system with variables for colors, spacing, etc.
   - Ensure responsive design across all components

3. **Component Best Practices**:
   - Limit props to essential inputs
   - Use composition for complex components
   - Implement prop validation with TypeScript

### Authentication and Security

1. **Authentication Flow**:
   - Implement Azure AD B2C authentication
   - Create protected routes and redirects
   - Handle token refresh and session management

2. **Security Measures**:
   - Implement CSRF protection
   - Sanitize user inputs
   - Handle sensitive data appropriately

### Performance Optimization

1. **Code Splitting**:
   - Implement route-based code splitting
   - Lazy load non-critical components

2. **Memoization**:
   - Use React.memo for expensive renders
   - Implement useMemo and useCallback for optimizations

3. **Bundle Optimization**:
   - Analyze and optimize bundle size
   - Implement tree shaking for dependencies

### Implementation Phases

We'll implement the refactoring in the following phases:

#### Phase 1: Setup and Infrastructure

1. Set up project structure
2. Configure ESLint, Prettier, and TypeScript
3. Implement testing framework and initial tests
4. Create base component library

#### Phase 2: Core Features

1. Implement authentication module
2. Create collections management feature
3. Build answer generation interface
4. Develop document retrieval components

#### Phase 3: Refinement and Optimization

1. Implement advanced UI features
2. Optimize performance
3. Add comprehensive test coverage
4. Refine documentation

## Conclusion

This refactoring plan provides a comprehensive approach to modernizing the frontend of the AI Ground Truth Generator project using Bulletproof React principles. By starting with a solid testing strategy and implementing a well-structured codebase, we'll create a maintainable, scalable, and robust application that can evolve with changing requirements.

The implementation will be guided by best practices in React development, with a focus on modularity, type safety, and user experience. Regular reviews and adjustments to the plan will ensure we remain aligned with project goals and requirements.
