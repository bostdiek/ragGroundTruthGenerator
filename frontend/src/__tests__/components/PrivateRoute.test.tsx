import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PrivateRoute from '../../features/auth/components/PrivateRoute';
import { useAuth } from '../../features/auth/contexts/AuthContext';

// Mock the AuthContext
vi.mock('../../features/auth/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('PrivateRoute', () => {
  const TestComponent = () => <div>Protected Content</div>;
  const renderComponent = () => {
    return render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/protected"
            element={
              <PrivateRoute>
                <TestComponent />
              </PrivateRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state when authentication is being checked', () => {
    (useAuth as any).mockReturnValue({
      isLoading: true,
      isAuthenticated: false,
    });

    renderComponent();

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render children when user is authenticated', () => {
    (useAuth as any).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
    });

    renderComponent();

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated', () => {
    (useAuth as any).mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
    });

    renderComponent();

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
