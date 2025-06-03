import { screen, fireEvent, waitFor } from '@testing-library/react';

/**
 * Page Object Model for Login page
 * 
 * This provides a high-level API for interacting with the login page
 * in tests, which makes tests more readable and maintainable.
 */
export class LoginPage {
  /**
   * Fill the login form with credentials
   */
  async fillLoginForm(username: string, password: string) {
    // Get the form elements
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    // Fill the form
    fireEvent.change(usernameInput, { target: { value: username } });
    fireEvent.change(passwordInput, { target: { value: password } });
    
    return { usernameInput, passwordInput };
  }
  
  /**
   * Submit the login form
   */
  async submitLoginForm() {
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);
  }
  
  /**
   * Login with given credentials
   */
  async login(username: string, password: string) {
    await this.fillLoginForm(username, password);
    await this.submitLoginForm();
  }
  
  /**
   * Check if the login page is displayed
   */
  async isDisplayed() {
    return screen.getByLabelText(/username/i) !== null;
  }
  
  /**
   * Check if the error message is displayed
   */
  async hasErrorMessage(message: string) {
    return await waitFor(() => {
      return screen.getByText(new RegExp(message, 'i')) !== null;
    });
  }
}

/**
 * Page Object Model for Navigation
 */
export class NavigationPage {
  /**
   * Click the logout button
   */
  async logout() {
    const logoutButton = await screen.findByRole('button', { name: /sign out/i });
    fireEvent.click(logoutButton);
  }
  
  /**
   * Navigate to a specific page
   */
  async navigateTo(linkText: string) {
    const link = screen.getByText(new RegExp(linkText, 'i'));
    fireEvent.click(link);
  }
  
  /**
   * Check if user is logged in by looking for the sign out button
   */
  async isLoggedIn() {
    try {
      const logoutButton = await screen.findByRole('button', { name: /sign out/i });
      return logoutButton !== null;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Get the displayed user info from the navigation bar
   */
  async getUserInfo() {
    try {
      // This assumes there's a user info element in the navbar
      // Adjust the selector based on your actual implementation
      const userInfo = await screen.findByTestId('user-info');
      return userInfo.textContent || '';
    } catch (error) {
      return '';
    }
  }
}

/**
 * Page Object Model for Collections page
 */
export class CollectionsPage {
  /**
   * Check if the collections page is displayed
   */
  async isDisplayed() {
    return await waitFor(() => {
      return screen.getByText(/collections/i) !== null;
    });
  }
  
  /**
   * Get all collection items
   */
  async getCollectionItems() {
    return screen.getAllByTestId('collection-item');
  }
  
  /**
   * Click on a collection by name
   */
  async clickCollection(name: string) {
    const collectionElement = screen.getByText(name);
    fireEvent.click(collectionElement);
  }
  
  /**
   * Click the create collection button
   */
  async clickCreateCollection() {
    const createButton = screen.getByRole('button', { name: /create collection/i });
    fireEvent.click(createButton);
  }
}
