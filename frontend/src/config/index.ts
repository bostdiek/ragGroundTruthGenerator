/**
 * AI Ground Truth Generator - Application Configuration
 *
 * This file contains application-wide configuration settings.
 * Customize these values to match your specific requirements.
 */

const config = {
  /**
   * API Configuration
   * Endpoint URLs and API settings
   */
  api: {
    // Base API URL - overridden by REACT_APP_API_URL environment variable if set
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:8000',

    // API timeout in milliseconds
    timeout: 30000,

    // API version
    version: 'v1',

    // API endpoints
    endpoints: {
      auth: '/auth',
      collections: '/collections',
      retrieval: '/retrieval',
      generation: '/generation',
    },
  },

  /**
   * Authentication Configuration
   * Auth provider settings
   */
  auth: {
    // Auth provider type - overridden by REACT_APP_AUTH_PROVIDER environment variable if set
    // Options: 'simple', 'azure', 'auth0'
    provider: process.env.REACT_APP_AUTH_PROVIDER || 'simple',

    // Token storage key in localStorage
    tokenKey: 'aigtg_auth_token',

    // User info storage key in localStorage
    userKey: 'aigtg_user_info',

    // Token expiration time in seconds (default: 1 hour)
    tokenExpiration: 3600,

    // Azure AD Configuration
    azure: {
      clientId: process.env.REACT_APP_AZURE_CLIENT_ID || '',
      authority:
        process.env.REACT_APP_AZURE_AUTHORITY ||
        'https://login.microsoftonline.com/common',
      redirectUri: window.location.origin,
      scopes: ['user.read'],
    },

    // Auth0 Configuration
    auth0: {
      domain: process.env.REACT_APP_AUTH0_DOMAIN || '',
      clientId: process.env.REACT_APP_AUTH0_CLIENT_ID || '',
      audience: process.env.REACT_APP_AUTH0_AUDIENCE || '',
      redirectUri: window.location.origin,
    },
  },

  /**
   * Feature Flags
   * Enable or disable specific features
   */
  features: {
    // Enable the creation of new collections
    createCollections: true,

    // Enable document search and retrieval
    documentRetrieval: true,

    // Enable answer generation
    answerGeneration: true,

    // Enable review workflow
    reviewWorkflow: true,

    // Enable tagging and metadata
    taggingAndMetadata: true,

    // Enable dark mode
    darkMode: false,
  },

  /**
   * UI Configuration
   * User interface settings
   */
  ui: {
    // Number of items to show per page in lists
    pageSize: 10,

    // Maximum length for question and answer previews
    maxPreviewLength: 100,

    // Delay for search input debounce (milliseconds)
    searchDebounce: 300,

    // Automatic save interval for drafts (milliseconds)
    autoSaveInterval: 60000, // 1 minute

    // Format for displaying dates
    dateFormat: 'MMM D, YYYY h:mm A',

    // Default sort order for collections
    defaultCollectionSort: 'updated_at',

    // Default sort direction
    defaultSortDirection: 'desc',
  },

  /**
   * Document Retrieval Configuration
   * Settings for document search and retrieval
   */
  retrieval: {
    // Maximum number of documents to retrieve
    maxDocuments: 5,

    // Default search filters
    defaultFilters: {},

    // Document content preview length
    previewLength: 250,
  },

  /**
   * Answer Generation Configuration
   * Settings for AI-generated answers
   */
  generation: {
    // Default maximum tokens for generated answers
    defaultMaxTokens: 1000,

    // Default rules for answer generation
    defaultRules: [
      {
        id: 'factual_accuracy',
        description: 'Ensure factual accuracy',
        type: 'constraint',
      },
      {
        id: 'answer_completeness',
        description: 'Provide complete answers',
        type: 'constraint',
      },
    ],
  },
};

export default config;
