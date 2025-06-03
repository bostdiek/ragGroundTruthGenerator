# State Management

This project uses a combination of React Query and Zustand for state management.

## React Query

React Query is used for server state management, providing a clean and efficient way to handle data fetching, caching, and updates.

### React Query Benefits

- Automatic caching and background refetching
- Loading and error states out of the box
- Optimistic updates
- Automatic retry logic
- Easy pagination and infinite scrolling

## Zustand

Zustand is used for client-side global state management, providing a simple and lightweight solution without the boilerplate of other state management libraries.

### Zustand Benefits

- Minimal boilerplate
- Simple to use with TypeScript
- Supports middleware for persistence, devtools, etc.
- No context providers needed

### Available Stores

- **Auth Store** (`src/stores/auth-store.ts`): Manages authentication state
- **UI Store** (`src/stores/ui-store.ts`): Manages global UI state like sidebar visibility
- **Error Store** (`src/stores/error-store.ts`): Manages global error handling

## Error Handling

The app includes a global error handling system:

- **Error Boundaries**: Catch and handle errors in React components
- **Error Store**: Centralized error state management
- **Toast Notifications**: User-friendly error messages

## Persistence

Selected stores are persisted to localStorage for a seamless user experience across page refreshes.

## Usage Examples

### Using React Query

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCollections, createCollection } from '../api/collections';

// Fetching data
const { data, isLoading, error } = useQuery({
  queryKey: ['collections'],
  queryFn: getCollections,
});

// Mutating data
const queryClient = useQueryClient();
const { mutate } = useMutation({
  mutationFn: createCollection,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['collections'] });
  },
});
```

### Using Zustand

```tsx
import { useAuthStore } from '../stores/auth-store';
import { useUIStore } from '../stores/ui-store';
import { useErrorStore } from '../stores/error-store';

// Using auth store
const { user, login, logout } = useAuthStore();

// Using UI store
const { isSidebarOpen, toggleSidebar } = useUIStore();

// Using error store
const { addError, clearErrors } = useErrorStore();
```
