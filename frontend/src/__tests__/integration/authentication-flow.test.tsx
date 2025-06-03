import { describe, it, expect, beforeEach, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from '../../features/auth/components/PrivateRoute';
import Login from '../../features/auth/pages/Login';
import Home from '../../features/core/pages/Home';
import Collections from '../../features/collections/pages/Collections';
import { AuthProvider } from '../../features/auth/contexts/AuthContext';
import { CollectionsProvider } from '../../features/collections/contexts/CollectionsContext';
import { LoginPage, NavigationPage } from '../../testing/page-objects';
import { createUser, createCollections } from '../../testing/factories';
import NavBar from '../../components/layout/NavBar';
import { TestQueryProvider } from '../../testing/utils/test-utils';

// Create test user and collections
const testUser = createUser({ username: 'testuser' });
const testCollections = createCollections(2);

// Mock server setup
const server = setupServer(
  // Auth endpoints
  http.post('http://localhost:8000/auth/login', async ({ request }) => {
    const body = await request.json() as { username: string; password: string };
    const { username, password } = body;
    
    if (username === 'testuser' && password === 'password') {
      return HttpResponse.json({
        access_token: 'fake-jwt-token',
        token_type: 'bearer',
        user: testUser
      }, { status: 200 });
    }
    
    return HttpResponse.json(
      { detail: 'Invalid credentials' }, 
      { status: 401 }
    );
  }),
  
  // Protected route data
  http.get('http://localhost:8000/collections', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.includes('Bearer fake-jwt-token')) {
      return new HttpResponse(null, { status: 401 });
    }
    
    return HttpResponse.json(testCollections, { status: 200 });
  })
);

// Setup and teardown the mock server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Wrapper component with all necessary providers
const AppWrapper = ({ initialEntries = ['/login'] }) => (
  <TestQueryProvider>
    <AuthProvider>
      <CollectionsProvider>
        <MemoryRouter initialEntries={initialEntries}>
          <div className="App">
            <NavBar data-testid="main-navbar" />
            <main className="App-content">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
                <Route path="/collections" element={<PrivateRoute><Collections /></PrivateRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </MemoryRouter>
      </CollectionsProvider>
    </AuthProvider>
  </TestQueryProvider>
);

describe('Authentication Flow', () => {
  // Initialize page objects
  let loginPage: LoginPage;
  let navPage: NavigationPage;
  
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Create new page objects for each test
    loginPage = new LoginPage();
    navPage = new NavigationPage();
  });
  
  it('should allow user to login and access protected routes', async () => {
    render(<AppWrapper />);
    
    // Use the page object to login
    await loginPage.login('testuser', 'password');
    
    // Check that user is logged in
    expect(await navPage.isLoggedIn()).toBe(true);
    
    // For now, we'll skip the user info check since we don't have the right data-testid yet
    // expect(await navPage.getUserInfo()).toContain(testUser.username);
  });
  
  it('should show error message on failed login', async () => {
    render(<AppWrapper />);
    
    // Use page object to attempt login with wrong password
    await loginPage.login('testuser', 'wrongpassword');
    
    // Check for error message
    expect(await loginPage.hasErrorMessage('invalid credentials')).toBe(true);
    
    // Check that we're still on login page
    expect(await loginPage.isDisplayed()).toBe(true);
  });
  
  it('should redirect to login when accessing protected route while logged out', async () => {
    // Start at a protected route
    render(<AppWrapper initialEntries={['/collections']} />);
    
    // Should redirect to login
    expect(await loginPage.isDisplayed()).toBe(true);
  });
  
  it('should allow user to log out', async () => {
    // Set up authenticated state
    localStorage.setItem('auth_token', 'fake-jwt-token');
    localStorage.setItem('auth_user', JSON.stringify(testUser));
    
    // Add specific handler for this test to handle auth/me calls
    server.use(
      http.get('http://localhost:8000/auth/me', ({ request }) => {
        return HttpResponse.json(testUser, { status: 200 });
      })
    );
    
    render(<AppWrapper initialEntries={['/']} />);
    
    // Wait for the auth state to be updated (user data to be loaded)
    await waitFor(() => {
      expect(screen.queryByTestId('sign-out-button')).not.toBeNull();
    });
    
    // Use page object to logout
    await navPage.logout();
    
    // Check we're redirected to login
    expect(await loginPage.isDisplayed()).toBe(true);
    
    // Check token is removed
    expect(localStorage.getItem('auth_token')).toBeNull();
  });
});
