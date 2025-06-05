import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Now import the component
import { useRetrievalContext } from '../../context/RetrievalContext';
import { RetrievalStatus } from '../../stores';
import RetrievalWorkflow from '../RetrievalWorkflow';

// Mock the context module before importing components that use it
vi.mock('../../context/RetrievalContext', () => {
  const useRetrievalContext = vi.fn();
  return {
    useRetrievalContext,
    RetrievalProvider: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
  };
});

describe('RetrievalWorkflow', () => {
  // Create a new QueryClient for each test
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  // Default mock context
  const defaultMockContext = {
    // Workflow state
    status: 'selecting_sources' as RetrievalStatus,
    setStatus: vi.fn(),
    error: null,
    isReady: true,

    // Source-related
    sources: [
      {
        id: 'source1',
        name: 'Test Source 1',
        type: 'memory',
        description: 'Test source description 1',
      },
      {
        id: 'source2',
        name: 'Test Source 2',
        type: 'memory',
        description: 'Test source description 2',
      },
    ],
    isLoadingSources: false,
    sourcesError: null,
    selectedSources: ['source1'],
    selectSource: vi.fn(),

    // Document-related
    documents: [
      {
        id: 'doc1',
        title: 'Test Document 1',
        content: 'This is test document 1 content',
        source: {
          id: 'source1',
          name: 'Test Source 1',
          type: 'memory',
          description: 'Test source description 1',
        },
        relevance_score: 0.9,
      },
    ],
    isLoadingDocuments: false,
    documentsError: null,
    selectedDocuments: [],
    selectDocument: vi.fn(),

    // Search state
    searchQuery: '',
    setSearchQuery: vi.fn(),

    // Filters
    filters: {},
    setFilter: vi.fn(),
    clearFilters: vi.fn(),

    // Workflow actions
    startWorkflow: vi.fn(),
    completeWorkflow: vi.fn(),
    resetWorkflow: vi.fn(),
    fetchRecommendedDocuments: vi.fn(),
    searchDocuments: vi.fn(),
    clearSelections: vi.fn(),
  };

  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
    vi.mocked(useRetrievalContext).mockReturnValue(defaultMockContext);
  });

  it('renders the workflow title and subtitle', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <RetrievalWorkflow question="test query" />
      </QueryClientProvider>
    );

    expect(screen.getByText('Document Retrieval')).toBeInTheDocument();
    expect(
      screen.getByText(
        /Find and select the most relevant documents for generating AI ground truth/i
      )
    ).toBeInTheDocument();
  });

  it('renders the step indicator with correct steps', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <RetrievalWorkflow question="test query" />
      </QueryClientProvider>
    );

    // Check for step indicators (these might be numbers, circles, or other UI elements)
    expect(screen.getByText(/Select Sources/i)).toBeInTheDocument();
    expect(screen.getByText(/Find Documents/i)).toBeInTheDocument();
    expect(screen.getByText(/Review Selection/i)).toBeInTheDocument();
  });

  it('renders the source selection step initially', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <RetrievalWorkflow question="test query" />
      </QueryClientProvider>
    );

    // SourceSelector is being mocked, but we can check if it would be rendered
    // based on the RetrievalWorkflow rendering logic
    expect(screen.getByText('Select Sources')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('calls onDocumentsSelected when workflow is completed', async () => {
    const mockOnDocumentsSelected = vi.fn();
    const user = userEvent.setup();

    // Set up the mock with selected documents
    const mockContextWithSelectedDocs = {
      ...defaultMockContext,
      selectedDocuments: [
        {
          id: 'doc1',
          title: 'Test Document 1',
          content: 'This is test document 1 content',
          source: {
            id: 'source1',
            name: 'Test Source 1',
            type: 'memory',
            description: 'Test source description 1',
          },
          relevance_score: 0.9,
        },
      ],
      status: 'completed' as RetrievalStatus,
    };

    vi.mocked(useRetrievalContext).mockReturnValue(mockContextWithSelectedDocs);

    render(
      <QueryClientProvider client={queryClient}>
        <RetrievalWorkflow
          question="test query"
          onDocumentsSelected={mockOnDocumentsSelected}
        />
      </QueryClientProvider>
    );

    // Find and click the Complete button
    const completeButton = screen.getByText('Complete Retrieval');
    await user.click(completeButton);

    // Verify the callback was called with the selected documents
    expect(mockContextWithSelectedDocs.completeWorkflow).toHaveBeenCalled();
    expect(mockOnDocumentsSelected).toHaveBeenCalledWith(
      mockContextWithSelectedDocs.selectedDocuments
    );
  });
});
