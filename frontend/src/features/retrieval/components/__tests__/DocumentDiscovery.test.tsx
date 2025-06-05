import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import DocumentDiscovery from '../DocumentDiscovery';

// Mock the retrieval store
vi.mock('../stores/retrievalStore', () => {
  return {
    default: () => ({
      // Document-related state
      documents: [
        {
          id: 'doc1',
          title: 'Test Document 1',
          content: 'This is test document 1 content',
          source: { id: 'source1', name: 'Test Source 1', type: 'memory' },
          relevance_score: 0.9,
        },
        {
          id: 'doc2',
          title: 'Test Document 2',
          content: 'This is test document 2 content',
          source: { id: 'source1', name: 'Test Source 1', type: 'memory' },
          relevance_score: 0.8,
        },
      ],
      selectedSources: ['source1'],
      searchQuery: 'test query',
      setSearchQuery: vi.fn(),
      selectDocument: vi.fn(),
      setStatus: vi.fn(),
    }),
  };
});

// Mock the react-query hook
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: () => ({
      isLoading: false,
      isError: false,
      error: null,
      data: null,
      refetch: vi.fn(),
    }),
  };
});

describe('DocumentDiscovery', () => {
  // Create a new QueryClient for each test
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  it('renders the document discovery component', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <DocumentDiscovery />
      </QueryClientProvider>
    );

    // Since we're mocking minimal functionality, just verify the component renders
    expect(
      screen.getByText(/Discover Relevant Documents/i)
    ).toBeInTheDocument();
  });
});
