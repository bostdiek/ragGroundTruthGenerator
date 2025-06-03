import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../../../../testing/setup';
import CreateQA from '../CreateQA';

// Mock the navigation function
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({ collectionId: '1' }),
  };
});

// Mock the services
vi.mock('../../collections/api/collections.service', () => ({
  default: {
    getQAPair: vi.fn(),
    createQAPair: vi.fn().mockResolvedValue({ id: 'new-qa-id' }),
    updateQAPair: vi.fn(),
  },
}));

vi.mock('../../retrieval/api/retrieval.service', () => ({
  default: {
    getSources: vi.fn().mockResolvedValue([
      { id: 'source-1', name: 'Test Source 1' },
      { id: 'source-2', name: 'Test Source 2' },
    ]),
    searchDocuments: vi.fn().mockResolvedValue([
      {
        id: 'doc-1',
        title: 'Test Document 1',
        content: 'This is test document 1 content.',
        source: { id: 'source-1', name: 'Test Source 1' },
      },
    ]),
  },
}));

// Test wrapper component with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/collections/1/create-qa']}>
      <Routes>
        <Route path="/collections/:collectionId/create-qa" element={children} />
      </Routes>
    </MemoryRouter>
  </QueryClientProvider>
);

describe('CreateQA Page', () => {
  beforeEach(() => {
    // Clear React Query cache between tests
    queryClient.clear();
  });

  it('renders the initial step with question input', () => {
    render(
      <TestWrapper>
        <CreateQA />
      </TestWrapper>
    );
    
    // Check that the question step is visible
    expect(screen.getByText('Define Question')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your question here...')).toBeInTheDocument();
  });
  
  it('allows navigation between steps', async () => {
    render(
      <TestWrapper>
        <CreateQA />
      </TestWrapper>
    );
    
    // Enter a question
    const questionInput = screen.getByPlaceholderText('Enter your question here...');
    fireEvent.change(questionInput, { target: { value: 'Test question?' } });
    
    // Move to the next step
    const nextButton = screen.getByText('Next: Select Documents');
    fireEvent.click(nextButton);
    
    // Wait for the documents step to be visible
    await waitFor(() => {
      expect(screen.getByText('Select relevant documents for your answer')).toBeInTheDocument();
    });
    
    // Go back to the question step
    const backButton = screen.getByText('Back: Edit Question');
    fireEvent.click(backButton);
    
    // Check that we're back at the question step
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter your question here...')).toBeInTheDocument();
    });
  });
  
  // More tests could be added for:
  // - Document selection
  // - Search functionality
  // - Answer generation
  // - Saving QA pairs
});
