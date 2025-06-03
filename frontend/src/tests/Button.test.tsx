import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../components/ui/Button';

describe('Button Component', () => {
  it('renders with the correct text', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders different variants correctly', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    const button = screen.getByText('Primary');
    
    // Check primary button styling (actual style checks would depend on implementation)
    expect(button).toBeInTheDocument();
    
    // Test secondary variant
    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByText('Secondary')).toBeInTheDocument();
    
    // Test outline variant
    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByText('Outline')).toBeInTheDocument();
    
    // Test text variant
    rerender(<Button variant="text">Text</Button>);
    expect(screen.getByText('Text')).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    expect(screen.getByText('Disabled Button')).toBeDisabled();
  });

  it('shows loading state when isLoading is true', () => {
    render(<Button isLoading>Loading Button</Button>);
    
    // Check if button has loading state applied
    const button = screen.getByText('Loading Button');
    expect(button).toHaveStyle('color: transparent'); // Part of loading style
  });

  it('passes a11y checks', async () => {
    const { container } = render(<Button aria-label="Accessible Button">Click Me</Button>);
    // For real a11y testing, use jest-axe or similar library
    // This is a placeholder for proper a11y testing
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Accessible Button');
  });
});
