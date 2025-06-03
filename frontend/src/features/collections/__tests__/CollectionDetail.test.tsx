import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../testing/utils/test-utils';
import { server } from '../../../testing/setup';
import { http, HttpResponse, delay } from 'msw';
import CollectionDetail from '../pages/CollectionDetail';
import CollectionsService from '../api/collections.service';

// Mock the useParams hook
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({
      collectionId: '1',
    }),
  };
});

// Mock collection data
const mockCollection = {
  id: '1',
  name: 'Test Collection',
  description: 'A collection for testing',
  created_at: '2025-05-01T12:00:00Z',
  updated_at: '2025-05-02T12:00:00Z',
  tags: ['test', 'sample'],
};

// Mock QA pairs
const mockQAPairs = [
  {
    id: '1',
    collection_id: '1',
    question: 'What is a test question?',
    answer: 'This is a test answer.',
    status: 'approved',
    created_at: '2025-05-01T14:00:00Z',
    updated_at: '2025-05-02T15:00:00Z',
    documents: [],
    created_by: 'user-1',
    metadata: {}
  },
  {
    id: '2',
    collection_id: '1',
    question: 'Another test question?',
    answer: 'Another test answer.',
    status: 'draft',
    created_at: '2025-05-03T14:00:00Z',
    updated_at: '2025-05-04T15:00:00Z',
    documents: [],
    created_by: 'user-1',
    metadata: {}
  },
];

describe('Collection Detail View', () => {
  beforeEach(() => {
    // Override the default handlers for collection detail endpoints
    server.use(
      http.get('http://localhost:8000/collections/:id', async () => {
        await delay(50); // Small delay to simulate network
        return HttpResponse.json(mockCollection);
      }),
      
      http.get('http://localhost:8000/collections/:id/qa-pairs', async () => {
        await delay(50); // Small delay to simulate network
        return HttpResponse.json(mockQAPairs);
      })
    );
  });

  it('renders the collection details with correct data', async () => {
    render(<CollectionDetail />);
    
    // Wait for collection details to load
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Check if collection details are displayed
    expect(screen.getByText('Test Collection')).toBeInTheDocument();
    expect(screen.getByText('A collection for testing')).toBeInTheDocument();
    
    // Check if tags are displayed
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('sample')).toBeInTheDocument();
  });

  it('displays the QA pairs for the collection', async () => {
    render(<CollectionDetail />);
    
    // Wait for collection and QA pairs to load
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Wait for QA pairs to render
    await waitFor(() => {
      expect(screen.getByText('What is a test question?')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Check if QA pairs are displayed
    expect(screen.getByText('This is a test answer.')).toBeInTheDocument();
    expect(screen.getByText('Another test question?')).toBeInTheDocument();
    expect(screen.getByText('Another test answer.')).toBeInTheDocument();
  });

  it('filters QA pairs by status', async () => {
    const user = userEvent.setup();
    render(<CollectionDetail />);
    
    // Wait for collection and QA pairs to load
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Wait for QA pairs to render
    await waitFor(() => {
      expect(screen.getByText('What is a test question?')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Find the status filter dropdown
    const statusFilter = screen.getByRole('combobox', { name: /status/i }) ||
                         screen.getByLabelText(/status/i);
    
    // Modify the server handler to only return "approved" QA pairs when filtering
    server.use(
      http.get('http://localhost:8000/collections/:id/qa-pairs', async () => {
        await delay(50);
        return HttpResponse.json([mockQAPairs[0]]); // Only return the first QA pair which is "approved"
      })
    );
    
    // Select "Approved" status
    await user.selectOptions(statusFilter, 'approved');
    
    // Wait for the filtered results to appear
    await waitFor(() => {
      expect(screen.queryByText('Another test question?')).not.toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Check if only the approved QA pair is displayed
    expect(screen.getByText('What is a test question?')).toBeInTheDocument();
    expect(screen.queryByText('Another test question?')).not.toBeInTheDocument();
  });

  it('searches QA pairs by question text', async () => {
    const user = userEvent.setup();
    render(<CollectionDetail />);
    
    // Wait for collection and QA pairs to load
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Wait for QA pairs to render
    await waitFor(() => {
      expect(screen.getByText('What is a test question?')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Modify the server handler to only return second QA pair when filtering
    server.use(
      http.get('http://localhost:8000/collections/:id/qa-pairs', async () => {
        await delay(50);
        return HttpResponse.json([mockQAPairs[1]]); // Only return the second QA pair for search
      })
    );
    
    // Find search input and type "Another"
    const searchInput = screen.getByPlaceholderText(/search/i) ||
                       screen.getByRole('textbox', { name: /search/i });
    await user.type(searchInput, 'Another');
    
    // Wait for filtered results
    await waitFor(() => {
      expect(screen.queryByText('What is a test question?')).not.toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Check if only matching QA pair is displayed
    expect(screen.queryByText('What is a test question?')).not.toBeInTheDocument();
    expect(screen.getByText('Another test question?')).toBeInTheDocument();
  });

  it('navigates to edit collection when the edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<CollectionDetail />);
    
    // Wait for collection to load
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Find and click the "Edit Collection" button
    const editButton = screen.getByRole('button', { name: /edit collection/i });
    await user.click(editButton);
    
    // Since we're using a mock router in tests, we can check if the navigation function was called
    // The actual navigation would be tested in an E2E test
    expect(editButton.getAttribute('href')).toContain('/collections/1/edit');
  });
});
