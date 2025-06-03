# Frontend Testing

This directory contains tests for the frontend application following the testing strategy outlined in the refactoring plan.

## Testing Philosophy

Our testing approach focuses on:

1. **Behavior over implementation**: Tests validate what the user sees and experiences, not internal implementation details
2. **Resilience to refactoring**: Tests should remain valid even when refactoring code
3. **Coverage of critical paths**: Prioritize testing the most important user flows

## Test Types

We implement several types of tests:

### Unit Tests

Located in `src/__tests__`, these test individual functions, hooks, and components in isolation.

Examples:

- Utility functions (`truncateString`, `formatDate`, etc.)
- Custom hooks (`useDebounce`, `useForm`, etc.)
- Simple components in isolation

### Integration Tests

Test interactions between related components and how they work together.

Examples:

- Components with context providers
- Service interactions with API

### End-to-End Tests

Located in `e2e-tests`, these test complete user flows from beginning to end using Playwright.

Examples:

- Authentication flow (login/logout)
- Collection creation and management
- QA pair creation and editing

## Setup

1. Install dependencies:

   ```bash
   # For unit and integration tests
   ./install-test-deps.sh
   
   # For E2E tests
   ./install-e2e-deps.sh
   ```

2. Run tests:

   ```bash
   # Run unit and integration tests once
   npm run test
   
   # Run tests in watch mode
   npm run test:watch
   
   # Run tests with coverage report
   npm run test:coverage
   
   # Run tests with UI
   npm run test:ui
   
   # Run E2E tests
   npm run e2e
   
   # Run E2E tests with UI
   npm run e2e:ui
   ```

## Testing Utilities

- **MSW**: For mocking API responses (`src/testing/mocks/handlers.ts`)
- **Testing Library**: For rendering and querying components
- **Vitest**: Test runner with Jest-compatible API
- **Playwright**: For E2E testing across browsers
- **Page Objects**: For abstracting page interactions (`src/testing/page-objects/index.ts`)
- **Test Data Factories**: For generating test data (`src/testing/factories/index.ts`)

## Writing Tests

### Unit Test Examples

```tsx
import { describe, it, expect } from 'vitest';
import { functionToTest } from '../path/to/function';

describe('functionToTest', () => {
  it('should do what it is supposed to do', () => {
    const result = functionToTest('input');
    expect(result).toBe('expected output');
  });
});
```

### Component Tests

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComponentToTest } from '../path/to/component';

describe('ComponentToTest', () => {
  it('should render correctly', () => {
    render(<ComponentToTest />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Context Tests

```tsx
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMyContext, MyContextProvider } from '../path/to/context';

describe('MyContext', () => {
  it('should provide expected values', () => {
    const wrapper = ({ children }) => (
      <MyContextProvider>{children}</MyContextProvider>
    );
    
    const { result } = renderHook(() => useMyContext(), { wrapper });
    expect(result.current.someValue).toBe('expected');
  });
});
```

### Page Object Model

We use the Page Object Model pattern to abstract interactions with pages and components, making tests more maintainable:

```tsx
// Using page objects in tests
import { LoginPage } from '../testing/page-objects';

it('should login successfully', async () => {
  const loginPage = new LoginPage();
  await loginPage.login('username', 'password');
  expect(await loginPage.hasErrorMessage('invalid')).toBe(false);
});
```

### Test Data Factories

We use factories to generate consistent test data:

```tsx
import { createUser, createCollection } from '../testing/factories';

// Create a user with default values
const user = createUser();

// Create a user with specific values
const adminUser = createUser({ 
  username: 'admin', 
  email: 'admin@example.com' 
});

// Create multiple collections
const collections = createCollections(3);
```

### E2E Tests

```tsx
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[id="username"]', 'demo');
  await page.fill('input[id="password"]', 'password');
  await page.click('button[type="submit"]');
  
  // Verify we're logged in
  await expect(page).toHaveURL(/.*\//);
  await expect(page.locator('button:has-text("Sign Out")')).toBeVisible();
});
```

## Best Practices

1. Use data attributes for test IDs (`data-testid="submit-button"`)
2. Test user interactions, not implementation details
3. Mock external dependencies (API calls, browser APIs)
4. Use the testing utilities provided in `src/testing/utils`
5. Run tests frequently during development

## Folder Structure

```plaintext
src/
|-- __tests__/               # Unit and integration tests
|   |-- components/          # Component tests
|   |-- contexts/            # Context tests
|   |-- integration/         # Integration tests
|   |-- services/            # Service tests
|   |-- utils/               # Utility function tests
|
|-- testing/                 # Testing utilities
|   |-- factories/           # Test data factories
|   |-- mocks/               # Mock data and handlers
|   |-- page-objects/        # Page Object Model classes
|   |-- utils/               # Test helper functions
|
e2e-tests/                   # End-to-end tests with Playwright
```

## Further Reading

- [Testing Library documentation](https://testing-library.com/docs/)
- [Vitest documentation](https://vitest.dev/)
- [MSW documentation](https://mswjs.io/docs/)
- [Playwright documentation](https://playwright.dev/docs/intro)
- [Page Object Model Pattern](https://martinfowler.com/bliki/PageObject.html)
