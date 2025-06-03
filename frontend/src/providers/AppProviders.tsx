/**
 * App Providers
 * 
 * This component sets up all the providers needed by the application.
 */

import { ReactNode } from 'react';
import { AuthProvider } from '../features/auth/contexts/AuthContext';
import { CollectionsProvider } from '../features/collections/contexts/CollectionsContext';
import { ReactQueryProvider } from '../lib/react-query';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <ReactQueryProvider>
      <AuthProvider>
        <CollectionsProvider>
          {children}
        </CollectionsProvider>
      </AuthProvider>
    </ReactQueryProvider>
  );
};
