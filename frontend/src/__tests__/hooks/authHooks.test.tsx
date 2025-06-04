import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import * as authService from '../../features/auth/api/authService';
import { AuthProvider } from '../../features/auth/contexts/AuthContext';
import { useRefreshToken } from '../../features/auth/hooks/authHooks';
import { useAuthStore } from '../../features/auth/stores/authStore';

// Mock the refreshToken API
vi.mock('../../features/auth/api/authService', async () => {
  const actual: any = await vi.importActual(
    '../../features/auth/api/authService'
  );
  return {
    ...actual,
    refreshToken: vi.fn(),
  };
});

describe('useRefreshToken', () => {
  it('updates auth store on successful token refresh', async () => {
    const mockResponse = {
      access_token: 'new-token',
      token_type: 'bearer',
      user: { id: '1', username: 'u', email: 'e' },
    };
    (authService.refreshToken as jest.Mock).mockResolvedValue(mockResponse);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result, waitFor } = renderHook(() => useRefreshToken(), {
      wrapper,
    });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => {
      const state = useAuthStore.getState();
      expect(state.token).toBe('new-token');
      expect(state.user).toEqual(mockResponse.user);
    });
  });
});
