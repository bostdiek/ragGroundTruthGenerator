import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import SourceSelector from '../SourceSelector';

describe('SourceSelector', () => {
  const mockSources = [
    {
      id: 'source1',
      name: 'Test Source 1',
      type: 'memory',
      description: 'Test source 1',
    },
    {
      id: 'source2',
      name: 'Test Source 2',
      type: 'file',
      description: 'Test source 2',
    },
  ];

  const mockSelectedSources = ['source1'];
  const mockOnSelectSource = vi.fn();

  it('renders the source selector component with sources', () => {
    render(
      <SourceSelector
        sources={mockSources}
        selectedSources={mockSelectedSources}
        onSelectSource={mockOnSelectSource}
        isLoading={false}
        error={null}
      />
    );

    // Check for title
    expect(screen.getByText('Select Data Sources')).toBeInTheDocument();

    // Check for source names
    expect(screen.getByText('Test Source 1')).toBeInTheDocument();
    expect(screen.getByText('Test Source 2')).toBeInTheDocument();
  });

  it('renders loading state when sources are loading', () => {
    render(
      <SourceSelector
        sources={[]}
        selectedSources={[]}
        onSelectSource={mockOnSelectSource}
        isLoading={true}
        error={null}
      />
    );

    // Check for loading message
    expect(
      screen.getByText('Loading available data sources...')
    ).toBeInTheDocument();

    // Check for the correct number of loading placeholders
    const loadingTitles = screen.getAllByText('Loading...');
    expect(loadingTitles).toHaveLength(3); // Three placeholders
  });

  it('renders error state when there is an error', () => {
    render(
      <SourceSelector
        sources={[]}
        selectedSources={[]}
        onSelectSource={mockOnSelectSource}
        isLoading={false}
        error="Failed to load sources"
      />
    );

    expect(screen.getByText(/Failed to load sources/i)).toBeInTheDocument();
  });

  it('handles source selection', async () => {
    render(
      <SourceSelector
        sources={mockSources}
        selectedSources={mockSelectedSources}
        onSelectSource={mockOnSelectSource}
        isLoading={false}
        error={null}
      />
    );

    // Find all source cards and click the second one (which should be unselected initially)
    const sourceCards = screen.getAllByRole('heading', { level: 3 });
    const secondSourceCard = sourceCards[1].closest('div');

    if (secondSourceCard) {
      await userEvent.click(secondSourceCard);
    }

    // Verify onSelectSource was called with the right arguments
    expect(mockOnSelectSource).toHaveBeenCalledWith('source2', true);
  });

  it('shows pre-selected sources correctly', () => {
    const { container } = render(
      <SourceSelector
        sources={mockSources}
        selectedSources={mockSelectedSources}
        onSelectSource={mockOnSelectSource}
        isLoading={false}
        error={null}
      />
    );

    // Find source card elements by source name
    const source1Element = screen.getByText('Test Source 1');
    const source2Element = screen.getByText('Test Source 2');

    // Get the parent card elements
    const source1Card = source1Element.closest('div');
    const source2Card = source2Element.closest('div');

    // Check that we found the cards
    expect(source1Card).not.toBeNull();
    expect(source2Card).not.toBeNull();

    // In the SourceSelector component, selected cards have a data-selected="true" attribute
    // To work around the styled-components class name issue, we'll query for this attribute directly
    const selectedCards = container.querySelectorAll(
      '[data-testid="source-card-selected"]'
    );
    const unselectedCards = container.querySelectorAll(
      '[data-testid="source-card-unselected"]'
    );

    // Verify we have the right number of selected and unselected cards
    expect(selectedCards).toHaveLength(1);
    expect(unselectedCards).toHaveLength(1);

    // Verify the correct card is selected
    expect(selectedCards[0].textContent).toContain('Test Source 1');
    expect(unselectedCards[0].textContent).toContain('Test Source 2');
  });
});
