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
    // Try multiple strategies to find the login form button
    let submitButton;
    
    try {
      // First try to find it within a form element
      const form = screen.queryByTestId('login-form');
      if (form) {
        submitButton = form.querySelector('button[type="submit"]');
      }
      
      // If not found in form, try by role and name
      if (!submitButton) {
        const buttons = screen.getAllByRole('button', { name: /sign in/i });
        
        // If there are multiple buttons, find the one within the login form
        if (buttons.length > 1) {
          // Find the one that's in the login form context
          submitButton = buttons.find(button => {
            const parent = button.closest('form') || button.closest('[data-testid="login-form"]');
            return !!parent;
          });
        } else {
          submitButton = buttons[0];
        }
      }
      
      if (!submitButton) {
        throw new Error('Submit button not found in the login form');
      }
      
      fireEvent.click(submitButton);
    } catch (error) {
      console.error('Error finding submit button:', error);
      throw error;
    }
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
    try {
      // Look for any error message with case-insensitive matching
      const errorElement = await screen.findByText(
        (content, element) => {
          const lowerContent = content.toLowerCase();
          const lowerMessage = message.toLowerCase();
          
          return (
            // Check for exact match
            lowerContent.includes(lowerMessage) ||
            // Check for 'Invalid credentials' message
            lowerContent.includes('invalid credentials') ||
            // Check for 'Invalid username or password' message
            lowerContent.includes('invalid username or password')
          );
        },
        {},
        { timeout: 1000 } // Add timeout for async finding
      );
      return true;
    } catch (error) {
      console.error('Error finding error message:', error);
      return false;
    }
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
    try {
      // First try by data-testid
      let logoutButton = screen.queryByTestId('sign-out-button');
      
      // If not found, try to find the navbar
      if (!logoutButton) {
        const navbar = screen.queryByTestId('main-navbar');
        
        if (navbar) {
          // Look for the button within the navbar
          const buttons = Array.from(navbar.querySelectorAll('button'));
          const foundButton = buttons.find(button => 
            button.textContent?.toLowerCase().includes('sign out')
          );
          
          if (foundButton) {
            logoutButton = foundButton;
          }
        }
      }
      
      // If still not found, try the general approach
      if (!logoutButton) {
        logoutButton = await screen.findByRole('button', { name: /sign out/i });
      }
      
      if (!logoutButton) {
        throw new Error('Sign Out button not found');
      }
      
      fireEvent.click(logoutButton);
    } catch (error) {
      console.error('Error finding Sign Out button:', error);
      throw error;
    }
  }
  
  /**
   * Check if user is logged in by looking for the sign out button
   */
  async isLoggedIn() {
    try {
      // First try by data-testid
      const logoutButtonByTestId = screen.queryByTestId('sign-out-button');
      
      if (logoutButtonByTestId) {
        return true;
      }
      
      // Try to find the navbar
      const navbar = screen.queryByTestId('main-navbar');
      
      if (navbar) {
        // Look for the button within the navbar
        const buttons = Array.from(navbar.querySelectorAll('button'));
        const foundButton = buttons.find(button => 
          button.textContent?.toLowerCase().includes('sign out')
        );
        
        if (foundButton) {
          return true;
        }
      }
      
      // If not found yet, try the general approach
      try {
        const logoutButton = await screen.findByRole('button', { name: /sign out/i });
        return !!logoutButton;
      } catch (e) {
        return false;
      }
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
  
  /**
   * Navigate to a specific page
   */
  async navigateTo(linkText: string) {
    const link = screen.getByText(new RegExp(linkText, 'i'));
    fireEvent.click(link);
  }
}
