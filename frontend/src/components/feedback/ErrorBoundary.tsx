import React from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { useErrorStore } from '../../stores/error-store';
import { toastService } from './Toast';

/**
 * Default error fallback component
 */
const DefaultErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <div className="error-container" role="alert">
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
};

interface AppErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<FallbackProps>;
  showToast?: boolean;
}

/**
 * App Error Boundary component
 * 
 * Wraps children in an error boundary that captures and handles errors
 */
export const AppErrorBoundary: React.FC<AppErrorBoundaryProps> = ({
  children,
  fallback = DefaultErrorFallback,
  showToast = true,
}) => {
  const addError = useErrorStore((state) => state.addError);

  /**
   * Error handler function
   */
  const onError = (error: Error) => {
    // Add error to global error store
    addError({
      message: error.message,
      details: error.stack,
    });

    // Show toast notification if enabled
    if (showToast) {
      toastService.error('An error occurred. Please try again or contact support.');
    }

    // Log error to console in development
    console.error('Error caught by boundary:', error);
  };

  return (
    <ErrorBoundary
      FallbackComponent={fallback}
      onError={onError}
      onReset={() => {
        // Reset any state that might have caused the error
        window.location.href = '/';
      }}
    >
      {children}
    </ErrorBoundary>
  );
};
