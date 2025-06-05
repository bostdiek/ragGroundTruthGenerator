import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { Document } from '../../../../types';
import DocumentTabControls from '../DocumentTabControls';

// Mock the store
jest.mock('../../stores/retrievalStore', () => ({
  __esModule: true,
  default: () => ({
    tabFilters: {},
    setTabFilter: jest.fn(),
  }),
}));

// Mock the UI components
jest.mock('../../../../components', () => ({
  Input: ({ label, value, onChange, placeholder }: any) => (
    <div>
      <label>{label}</label>
      <input
        data-testid="search-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  ),
  Select: ({ label, value, onChange, options }: any) => (
    <div>
      <label>{label}</label>
      <select
        data-testid={`select-${label.toLowerCase().replace(/\s+/g, '-')}`}
        value={value}
        onChange={onChange}
      >
        {options.map((option: any) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  ),
}));

const mockDocuments: Document[] = [
  {
    id: '1',
    title: 'Test Document 1',
    content: 'This is test content for document 1',
    url: 'https://example.com/doc1',
    relevance_score: 0.9,
    metadata: {
      type: 'manual',
      topic: 'installation',
      created_date: '2023-01-01',
    },
    source: {
      id: 'test-source',
      name: 'Test Source',
      type: 'memory',
    },
  },
  {
    id: '2',
    title: 'Test Document 2',
    content: 'This is test content for document 2',
    url: 'https://example.com/doc2',
    relevance_score: 0.7,
    metadata: {
      type: 'guide',
      topic: 'technical',
      created_date: '2023-01-02',
    },
    source: {
      id: 'test-source',
      name: 'Test Source',
      type: 'memory',
    },
  },
];

describe('DocumentTabControls', () => {
  const mockOnFilteredDocuments = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input and sort controls', () => {
    render(
      <DocumentTabControls
        documents={mockDocuments}
        onFilteredDocuments={mockOnFilteredDocuments}
        sourceId="test-source"
      />
    );

    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByTestId('select-sort-by')).toBeInTheDocument();
  });

  it('generates filter options based on document metadata', () => {
    render(
      <DocumentTabControls
        documents={mockDocuments}
        onFilteredDocuments={mockOnFilteredDocuments}
        sourceId="test-source"
      />
    );

    // Should have filter dropdowns for type and topic
    expect(screen.getByTestId('select-filter-by-type')).toBeInTheDocument();
    expect(screen.getByTestId('select-filter-by-topic')).toBeInTheDocument();
  });

  it('filters documents when search text is entered', () => {
    render(
      <DocumentTabControls
        documents={mockDocuments}
        onFilteredDocuments={mockOnFilteredDocuments}
        sourceId="test-source"
      />
    );

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'Document 1' } });

    // Should call onFilteredDocuments with filtered results
    expect(mockOnFilteredDocuments).toHaveBeenCalled();
  });

  it('shows correct document count', () => {
    render(
      <DocumentTabControls
        documents={mockDocuments}
        onFilteredDocuments={mockOnFilteredDocuments}
        sourceId="test-source"
      />
    );

    expect(screen.getByText('Showing 2 of 2 documents')).toBeInTheDocument();
  });
});
