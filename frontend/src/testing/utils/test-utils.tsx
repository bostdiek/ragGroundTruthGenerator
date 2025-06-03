import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../features/auth/contexts/AuthContext';
import { CollectionsProvider } from '../../features/collections/contexts/CollectionsContext';

/**
 * Custom render function that includes providers
 * This allows us to render components with the necessary context providers
 */
const AllProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <CollectionsProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </CollectionsProvider>
    </AuthProvider>
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

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render, renderWithRouter, renderWithAuth };
