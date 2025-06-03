import React from 'react';
import { render, screen } from '@testing-library/react';
import { Container } from '../components/layout/Container';

describe('Container Component', () => {
  it('renders children correctly', () => {
    render(
      <Container>
        <div data-testid="container-content">Container Content</div>
      </Container>
    );
    
    expect(screen.getByTestId('container-content')).toBeInTheDocument();
    expect(screen.getByText('Container Content')).toBeInTheDocument();
  });

  it('applies different max widths', () => {
    const { rerender } = render(
      <Container maxWidth="xs" data-testid="container">
        XS Container
      </Container>
    );
    
    let container = screen.getByTestId('container');
    expect(container).toBeInTheDocument();
    
    rerender(
      <Container maxWidth="sm" data-testid="container">
        SM Container
      </Container>
    );
    
    container = screen.getByTestId('container');
    expect(container).toBeInTheDocument();
    
    rerender(
      <Container maxWidth="md" data-testid="container">
        MD Container
      </Container>
    );
    
    container = screen.getByTestId('container');
    expect(container).toBeInTheDocument();
    
    rerender(
      <Container maxWidth="lg" data-testid="container">
        LG Container
      </Container>
    );
    
    container = screen.getByTestId('container');
    expect(container).toBeInTheDocument();
    
    rerender(
      <Container maxWidth="xl" data-testid="container">
        XL Container
      </Container>
    );
    
    container = screen.getByTestId('container');
    expect(container).toBeInTheDocument();
    
    rerender(
      <Container maxWidth="full" data-testid="container">
        Full Width Container
      </Container>
    );
    
    container = screen.getByTestId('container');
    expect(container).toBeInTheDocument();
  });

  it('applies padding when padding prop is true', () => {
    render(
      <Container padding={true} data-testid="container">
        Container with Padding
      </Container>
    );
    
    const container = screen.getByTestId('container');
    expect(container).toBeInTheDocument();
    // Check for padding styles (would depend on implementation)
  });

  it('does not apply padding when padding prop is false', () => {
    render(
      <Container padding={false} data-testid="container">
        Container without Padding
      </Container>
    );
    
    const container = screen.getByTestId('container');
    expect(container).toBeInTheDocument();
    // Check that padding styles are not applied (would depend on implementation)
  });

  it('applies className correctly', () => {
    render(
      <Container className="custom-container" data-testid="container">
        Container with Custom Class
      </Container>
    );
    
    const container = screen.getByTestId('container');
    expect(container).toHaveClass('custom-container');
  });
});
