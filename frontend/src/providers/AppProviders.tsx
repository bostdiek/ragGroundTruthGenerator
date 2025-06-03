/**
 * App Providers
 * 
 * This component sets up all the providers needed by the application.
 */

import { ReactNode } from 'react';
import { AuthProvider } from '../features/auth/contexts/AuthContext';
import { CollectionsProvider } from '../features/collections/contexts/CollectionsContext';
import { ReactQueryProvider } from '../lib/react-query';
import { AppErrorBoundary } from '../components/feedback/ErrorBoundary';
import { ToastProvider } from '../components/feedback/Toast';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <ReactQueryProvider>
      <ToastProvider>
        <AppErrorBoundary>
          <AuthProvider>
            <CollectionsProvider>
              {children}
            </CollectionsProvider>
          </AuthProvider>
        </AppErrorBoundary>
      </ToastProvider>
    </ReactQueryProvider>
  );
};
