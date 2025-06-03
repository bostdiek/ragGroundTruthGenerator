import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../testing/utils/test-utils';
import { server } from '../../../testing/setup';
import { http, HttpResponse, delay } from 'msw';
import CreateCollection from '../pages/CreateCollection';

// Mock navigation function
const mockNavigate = vi.fn();

// Mock useParams hook
const mockUseParams = vi.fn().mockReturnValue({});

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockUseParams(),
  };
});

describe('Collection Creation', () => {
  beforeEach(() => {
    // Reset mocks
    mockNavigate.mockReset();
    mockUseParams.mockReturnValue({}); // Empty params for create mode
    
    // Mock the API endpoint for creating a collection
    server.use(
      http.post('http://localhost:8000/collections', async ({ request }) => {
        const body = await request.json() as any;
        return HttpResponse.json({
          id: '123',
          ...body,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { status: 201 });
      })
    );
  });

  it('renders the collection creation form', () => {
    render(<CreateCollection />);
    
    // Check that the title is correct
    expect(screen.getByRole('heading', { name: /Create Collection/i })).toBeInTheDocument();
    expect(screen.getByText(/Create a new collection to organize your Q&A pairs/i)).toBeInTheDocument();
    
    // Check if form elements are rendered
    expect(screen.getByLabelText(/Collection Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tags/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Collection/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<CreateCollection />);
    
    // Try to submit without filling required fields
    const createButton = screen.getByRole('button', { name: /Create Collection/i });
    await user.click(createButton);
    
    // Check for validation messages
    await waitFor(() => {
      expect(screen.getByText(/Collection name is required/i)).toBeInTheDocument();
    });
  });

  it('creates a new collection with valid data', async () => {
    const user = userEvent.setup();
    render(<CreateCollection />);
    
    // Fill in the form
    await user.type(screen.getByLabelText(/Collection Name/i), 'New Test Collection');
    await user.type(screen.getByLabelText(/Description/i), 'This is a new test collection');
    
    // Add tags (assuming this is a comma-separated input or similar)
    await user.type(screen.getByLabelText(/Tags/i), 'new,test');
    await user.click(screen.getByRole('button', { name: /Add/i }));
    
    // Submit the form
    const createButton = screen.getByRole('button', { name: /Create Collection/i });
    await user.click(createButton);
    
    // Check if API call was made (indirectly by checking navigation)
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/collections/123');
    });
  });

  it('cancels creation and navigates back', async () => {
    const user = userEvent.setup();
    render(<CreateCollection />);
    
    // Click the cancel button
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);
    
    // Check if navigation was called
    expect(mockNavigate).toHaveBeenCalledWith('/collections');
  });
});

// Now test the edit collection functionality
describe('Collection Editing', () => {
  // Mock collection data for editing
  const mockCollection = {
    id: '456',
    name: 'Existing Collection',
    description: 'This is an existing collection',
    tags: ['existing', 'collection'],
    created_at: '2025-05-01T12:00:00Z',
    updated_at: '2025-05-02T12:00:00Z',
  };
  
  beforeEach(() => {
    // Reset mocks
    mockNavigate.mockReset();
    mockUseParams.mockReturnValue({ collectionId: '456' }); // Set collectionId for edit mode
    
    // Mock the API endpoint for getting and updating a collection
    server.use(
      http.get('http://localhost:8000/collections/:id', ({ params }) => {
        return HttpResponse.json(mockCollection);
      }),
      
      http.put('http://localhost:8000/collections/:id', async ({ request }) => {
        const body = await request.json() as any;
        return HttpResponse.json({
          ...mockCollection,
          ...body,
          updated_at: new Date().toISOString(),
        });
      })
    );
  });

  it('loads and displays existing collection data for editing', async () => {
    render(<CreateCollection />);
    
    // Wait for collection data to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('Existing Collection')).toBeInTheDocument();
    });
    
    // Check if form is pre-filled with existing data
    expect(screen.getByDisplayValue('This is an existing collection')).toBeInTheDocument();
    
    // For the tags, we're now displaying them as individual tag elements, not a comma-separated string
    expect(screen.getByText('existing')).toBeInTheDocument();
    expect(screen.getByText('collection')).toBeInTheDocument();
    
    // Check if the button says "Update" instead of "Create"
    expect(screen.getByRole('button', { name: /Update Collection/i })).toBeInTheDocument();
  });

  it('updates an existing collection with new data', async () => {
    const user = userEvent.setup();
    render(<CreateCollection />);
    
    // Wait for collection data to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('Existing Collection')).toBeInTheDocument();
    });
    
    // Update the form fields
    const nameInput = screen.getByLabelText(/Collection Name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Collection');
    
    // Submit the form
    const updateButton = screen.getByRole('button', { name: /Update Collection/i });
    await user.click(updateButton);
    
    // Check if API call was made (indirectly by checking navigation)
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/collections/456');
    });
  });
});
