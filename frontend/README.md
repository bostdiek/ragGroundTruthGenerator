# AI Ground Truth Generator Frontend

This is the frontend component of the AI Ground Truth Generator project, built with React and TypeScript. It provides a modern, responsive user interface for managing collections, retrieving documents, and generating ground truth data for AI training.

## Project Structure

The frontend follows a feature-based architecture inspired by [Bulletproof React](https://github.com/alan2207/bulletproof-react). This architecture organizes code by features rather than technical concerns, making the codebase more maintainable and scalable.

```plaintext
src/
├── components/      # Shared UI components
│   ├── form/        # Form-related components
│   ├── layout/      # Layout components like NavBar
│   └── ui/          # Basic UI components
├── features/        # Feature-based modules
│   ├── auth/        # Authentication feature
│   │   ├── api/     # API services
│   │   ├── components/
│   │   ├── contexts/
│   │   └── pages/
│   ├── collections/ # Collections management
│   ├── core/        # Core application features
│   ├── generation/  # QA generation
│   └── retrieval/   # Document retrieval
├── lib/             # Shared libraries
│   └── api/         # API utilities
├── styles/          # Global styles
├── testing/         # Testing utilities
└── types/           # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Development Setup

1. **Install dependencies**:

   ```bash
   npm install
   # or
   yarn install
   ```

2. **Start the development server**:

   ```bash
   npm start
   # or
   yarn start
   ```

   The application will be available at [http://localhost:3000](http://localhost:3000).

3. **Environment variables**:

   Create a `.env` file in the frontend directory with the following variables:

   ```plaintext
   REACT_APP_API_URL=http://localhost:8000
   REACT_APP_AUTH_PROVIDER=simple
   ```

## Testing

The frontend includes a comprehensive testing suite using Vitest, Testing Library, and MSW for API mocking.

1. **Install testing dependencies**:

   ```bash
   ./install-test-deps.sh
   ```

2. **Run tests**:

   ```bash
   # Run all tests
   npm run test
   
   # Run tests in watch mode
   npm run test:watch
   
   # Generate test coverage report
   npm run test:coverage
   
   # Run tests with UI
   npm run test:ui
   ```

For more information about our testing approach, see [TESTING.md](./TESTING.md).

## Building for Production

```bash
npm run build
# or
yarn build
```

This will create an optimized production build in the `build` folder.

## Docker Support

The frontend includes Docker support for containerized deployment:

```bash
# Build the Docker image
docker build -t ai-ground-truth-frontend .

# Run the container
docker run -p 3000:3000 ai-ground-truth-frontend
```

## Architecture and Customization

The frontend follows a modular, component-based architecture that is designed to be easily customized and extended.

### Directory Structure

```plaintext
frontend/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable UI components
│   ├── config/         # Application configuration
│   ├── contexts/       # React context providers
│   ├── pages/          # Page components
│   ├── services/       # API service clients
│   ├── styles/         # Global styles and theme
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── App.tsx         # Main application component
│   └── index.tsx       # Application entry point
└── package.json        # Project dependencies
```

### Core Files for Customization

1. **Types (`src/types/index.ts`)**:
   - Contains all data type definitions used throughout the application
   - Customize these interfaces to match your specific data structure
   - Each interface includes detailed comments on customization options

2. **Theme (`src/styles/theme.ts`)**:
   - Defines colors, typography, spacing, and other design tokens
   - Customize to match your organization's branding

3. **Configuration (`src/config/index.ts`)**:
   - Contains application-wide settings
   - Customize API endpoints, feature flags, and UI preferences

4. **Utilities (`src/utils/index.ts`)**:
   - Common utility functions and custom hooks
   - Add your own utilities as needed

### Customizing Data Types

The application uses a central type system defined in `src/types/index.ts`. To customize data types:

1. Modify the interfaces in this file to match your data structure
2. Add additional fields or properties as needed
3. Update the corresponding API service clients in `src/services/`

Example customization:

```typescript
// Add custom fields to the QAPair interface
export interface QAPair {
  // ...existing fields
  
  // Add your custom fields
  confidence_score: number;
  review_comments: string;
  alternate_answers: string[];
}
```

### Customizing UI Components

Components are designed to be easily customizable:

1. Styled components use the theme settings from `src/styles/theme.ts`
2. Modify the theme to change colors, typography, spacing, etc.
3. Create new components by extending existing ones

Example theme customization:

```typescript
// Customize primary colors
const theme = {
  colors: {
    primary: '#0078d4', // Microsoft blue
    primaryDark: '#106ebe',
    primaryLight: '#c7e0f4',
    // ...other colors
  },
  // ...other theme settings
};
```

### Customizing Display Features

To customize what information is displayed and how:

1. Modify the page components in `src/pages/`
2. Adjust the UI configuration in `src/config/index.ts`
3. Create new display components as needed

Example configuration customization:

```typescript
// Customize UI settings
const config = {
  ui: {
    pageSize: 10,
    maxPreviewLength: 100,
    searchDebounce: 300,
    // ...other UI settings
  },
  // ...other configuration
};
```

## Authentication Providers

The application supports multiple authentication providers:

1. **Simple Authentication** (default for development)
   - Basic email/password authentication
   - Suitable for development and testing

2. **Azure AD / Microsoft Entra ID**
   - For Microsoft ecosystem integration
   - Configured through environment variables

3. **Custom Authentication**
   - Implement your own authentication provider
   - See `src/services/auth.service.ts` for integration points

## API Integration

The application uses a service-based approach for API integration:

1. **API Client** (`src/services/api.ts`):
   - Base API client with interceptors and error handling

2. **Service Clients**:
   - Collections service (`src/services/collections.service.ts`)
   - Retrieval service (`src/services/retrieval.service.ts`)
   - Generation service (`src/services/generation.service.ts`)
   - Authentication service (`src/services/auth.service.ts`)

Customize these services to match your backend API endpoints and data structures.

## Learn More

- [React Documentation](https://reactjs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Styled Components](https://styled-components.com/)
