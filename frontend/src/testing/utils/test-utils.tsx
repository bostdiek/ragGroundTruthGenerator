import { QueryClientProvider } from '@tanstack/react-query';
import { render, RenderOptions } from '@testing-library/react';
import React, { ReactElement, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';

import {
  AuthProvider,
  useAuth,
} from '../../features/auth/contexts/AuthContext';
import { CollectionsProvider } from '../../features/collections/contexts/CollectionsContext';
import { queryClient } from '../setup';

/**
 * Custom render function that includes providers
 * This allows us to render components with the necessary context providers
 */
const AllProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CollectionsProvider>
          <BrowserRouter>{children}</BrowserRouter>
        </CollectionsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

/**
 * Authentication wrapper that simulates a logged-in state
 */
export const AuthenticatedWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { login } = useAuth();

  useEffect(() => {
    // Simulate user login - the login function needs username and password
    const username = 'testuser';
    const password = 'password';

    // Only attempt login if not already authenticated
    if (!localStorage.getItem('auth_token')) {
      login(username, password).catch(error => {
        console.error('Login failed in AuthenticatedWrapper:', error);
      });
    }
  }, [login]);

  return <>{children}</>;
};

/**
 * React Query Test Provider
 * Uses the shared queryClient for consistent test isolation
 */
export const TestQueryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

/**
 * Custom render function with all providers
 */
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

/**
 * Render with specific providers only
 */
const renderWithRouter = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: BrowserRouter, ...options });

const renderWithAuth = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AuthProvider, ...options });

const renderWithQuery = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: TestQueryProvider, ...options });

const renderWithAuthAndQuery = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <TestQueryProvider>
      <AuthProvider>{children}</AuthProvider>
    </TestQueryProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export {
  customRender as render,
  renderWithAuth,
  renderWithAuthAndQuery,
  renderWithQuery,
  renderWithRouter,
};
