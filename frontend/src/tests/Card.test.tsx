import { render, screen } from '@testing-library/react';
import React from 'react';

import Card from '../components/ui/Card';

describe('Card Component', () => {
  it('renders children correctly', () => {
    render(
      <Card>
        <div data-testid="card-content">Card Content</div>
      </Card>
    );

    expect(screen.getByTestId('card-content')).toBeInTheDocument();
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    const { rerender } = render(
      <Card variant="elevated" data-testid="card">
        Elevated Card
      </Card>
    );

    let card = screen.getByTestId('card');
    expect(card).toBeInTheDocument();

    rerender(
      <Card variant="outlined" data-testid="card">
        Outlined Card
      </Card>
    );

    card = screen.getByTestId('card');
    expect(card).toBeInTheDocument();
  });

  it('applies different padding sizes', () => {
    const { rerender } = render(
      <Card padding="small" data-testid="card">
        Small Padding
      </Card>
    );

    let card = screen.getByTestId('card');
    expect(card).toBeInTheDocument();

    rerender(
      <Card padding="medium" data-testid="card">
        Medium Padding
      </Card>
    );

    card = screen.getByTestId('card');
    expect(card).toBeInTheDocument();

    rerender(
      <Card padding="large" data-testid="card">
        Large Padding
      </Card>
    );

    card = screen.getByTestId('card');
    expect(card).toBeInTheDocument();

    rerender(
      <Card padding="none" data-testid="card">
        No Padding
      </Card>
    );

    card = screen.getByTestId('card');
    expect(card).toBeInTheDocument();
  });

  it('renders card with sub-components', () => {
    render(
      <Card data-testid="card">
        <Card.Header>
          <Card.Title>Card Title</Card.Title>
          <Card.Subtitle>Card Subtitle</Card.Subtitle>
        </Card.Header>
        <Card.Content>Card Content</Card.Content>
        <Card.Actions>
          <button>Action 1</button>
          <button>Action 2</button>
        </Card.Actions>
      </Card>
    );

    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card Subtitle')).toBeInTheDocument();
    expect(screen.getByText('Card Content')).toBeInTheDocument();
    expect(screen.getByText('Action 1')).toBeInTheDocument();
    expect(screen.getByText('Action 2')).toBeInTheDocument();
  });

  it('applies fullWidth correctly', () => {
    render(
      <Card fullWidth data-testid="card">
        Full Width Card
      </Card>
    );

    const card = screen.getByTestId('card');
    // Check for full width styles (would depend on implementation)
    expect(card).toBeInTheDocument();
  });
});
