import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { Input } from '../components/ui/Input';

// Create a mock for jest/vitest functions
const mockFn = () => jest.fn();
if (typeof jest === 'undefined') {
  // If using vitest
  global.jest = {
    fn: () => ({ mockImplementation: (fn) => fn })
  } as any;
}

describe('Input Component', () => {
  it('renders with the correct label', () => {
    render(<Input label="Username" />);
    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('accepts input value changes', () => {
    render(<Input label="Email" placeholder="Enter your email" />);
    const input = screen.getByPlaceholderText('Enter your email');
    
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    expect(input).toHaveValue('test@example.com');
  });

  it('displays error state correctly', () => {
    render(
      <Input 
        label="Password" 
        error={true} 
        helperText="Password is required" 
      />
    );
    
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    // Check that the error styling is applied (depends on implementation)
  });

  it('calls onChange handler when value changes', () => {
    const handleChange = vi.fn();
    render(<Input label="Search" onChange={handleChange} />);
    
    const input = screen.getByLabelText('Search');
    fireEvent.change(input, { target: { value: 'test search' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Input label="Disabled Input" disabled />);
    expect(screen.getByLabelText('Disabled Input')).toBeDisabled();
  });

  it('passes a11y checks', () => {
    render(<Input label="Accessible Input" aria-describedby="hint" />);
    
    // Basic a11y check - input should be associated with its label
    const input = screen.getByLabelText('Accessible Input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-describedby', 'hint');
  });

  it('renders different sizes correctly', () => {
    const { rerender } = render(<Input label="Small" size="small" data-testid="input" />);
    
    // Size checks would depend on implementation
    let input = screen.getByTestId('input');
    expect(input).toBeInTheDocument();
    
    rerender(<Input label="Medium" size="medium" data-testid="input" />);
    input = screen.getByTestId('input');
    expect(input).toBeInTheDocument();
    
    rerender(<Input label="Large" size="large" data-testid="input" />);
    input = screen.getByTestId('input');
    expect(input).toBeInTheDocument();
  });
});
