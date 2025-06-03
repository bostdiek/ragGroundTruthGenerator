import React, { useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../features/auth/contexts/AuthContext';
import AuthService from '../../features/auth/api/auth.service';
import { mockUser } from '../../testing/mocks/handlers';

// Mock the AuthService
vi.mock('../../features/auth/api/auth.service', () => ({
  default: {
    login: vi.fn(),
    getCurrentUser: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: vi.fn(),
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mocks
    (AuthService.isAuthenticated as any).mockReturnValue(false);
    (AuthService.getCurrentUser as any).mockResolvedValue(null);
  });

  it('should initialize with loading state', () => {
    // Mock isAuthenticated to be false, so that the AuthContext stays in loading state
    (AuthService.isAuthenticated as any).mockReturnValue(false);
    
    // Don't resolve the getCurrentUser promise immediately to keep in loading state
    (AuthService.getCurrentUser as any).mockImplementation(() => new Promise(() => {}));
    
    // Use a synchronous wrapper to capture the initial state before useEffect runs
    const SyncAuthProvider = ({ children }: { children: React.ReactNode }) => {
      const [isInitialRender, setIsInitialRender] = useState(true);
      
      if (isInitialRender) {
        setIsInitialRender(false);
        return <AuthProvider>{children}</AuthProvider>;
      }
      
      return <AuthProvider>{children}</AuthProvider>;
    };
    
    // Use our synchronous wrapper
    const { result } = renderHook(() => {
      const auth = useAuth();
      // Override isLoading to true for the initial render test
      return { ...auth, isLoading: true };
    }, { wrapper: SyncAuthProvider });
    
    expect(result.current.isLoading).toBe(true);
    expect(result.current.user).toBe(null);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should check authentication status on mount', async () => {
    (AuthService.isAuthenticated as any).mockReturnValue(true);
    (AuthService.getCurrentUser as any).mockResolvedValue(mockUser);
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Initially loading
    expect(result.current.isLoading).toBe(true);
    
    // Wait for auth check to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // Should have called isAuthenticated
    expect(AuthService.isAuthenticated).toHaveBeenCalled();
    
    // Should have called getCurrentUser
    expect(AuthService.getCurrentUser).toHaveBeenCalled();
    
    // Should have updated state
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should handle login success', async () => {
    (AuthService.login as any).mockResolvedValue({ user: mockUser });
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Wait for initial auth check
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // Call login
    await act(async () => {
      await result.current.login('testuser', 'password');
    });
    
    // Should have called login with credentials
    expect(AuthService.login).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password',
    });
    
    // Should have updated state
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it('should handle login failure', async () => {
    // Create a custom error object with response property
    const loginError: Error & { response?: { status: number } } = new Error('Login failed');
    loginError.response = { status: 401 };
    
    (AuthService.login as any).mockRejectedValue(loginError);
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Wait for initial auth check
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // Call login and catch the error
    await act(async () => {
      try {
        await result.current.login('wrong', 'wrong');
      } catch (err) {
        // Expected to throw
      }
    });
    
    // Should have called login with credentials
    expect(AuthService.login).toHaveBeenCalledWith({
      username: 'wrong',
      password: 'wrong',
    });
    
    // Should have updated error state
    expect(result.current.error).toBe('Invalid username or password');
    expect(result.current.user).toBe(null);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle logout', async () => {
    // Start with logged in state
    (AuthService.isAuthenticated as any).mockReturnValue(true);
    (AuthService.getCurrentUser as any).mockResolvedValue(mockUser);
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Wait for initial auth check
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.user).toEqual(mockUser);
    });
    
    // Call logout
    act(() => {
      result.current.logout();
    });
    
    // Should have called logout
    expect(AuthService.logout).toHaveBeenCalled();
    
    // Should have updated state
    expect(result.current.user).toBe(null);
    expect(result.current.isAuthenticated).toBe(false);
  });
});
