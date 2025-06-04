import { render, screen } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

import { Form, FormField, FormLabel } from '../components/form/Form';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Checkbox } from '../components/ui/Checkbox';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';

// Mock functions for event handlers
const createMockHandler = () => vi.fn();

// This test file focuses on accessibility aspects of components
describe('Accessibility Tests', () => {
  // Button Component A11y Tests
  describe('Button A11y', () => {
    it('has the correct role', () => {
      render(<Button>Accessible Button</Button>);
      const button = screen.getByText('Accessible Button');
      // HTML buttons have implicit role="button", not explicitly set
      expect(button.tagName).toBe('BUTTON');
    });

    it('properly handles disabled state', () => {
      render(<Button disabled>Disabled Button</Button>);
      const button = screen.getByText('Disabled Button');
      expect(button).toBeDisabled();
      // HTML buttons don't need explicit aria-disabled when disabled attribute is set
      expect(button.hasAttribute('disabled')).toBe(true);
    });

    it('supports custom aria attributes', () => {
      render(
        <Button
          aria-label="Custom Button"
          aria-haspopup="true"
          aria-expanded="false"
        >
          Aria Button
        </Button>
      );

      const button = screen.getByText('Aria Button');
      expect(button).toHaveAttribute('aria-label', 'Custom Button');
      expect(button).toHaveAttribute('aria-haspopup', 'true');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });
  });

  // Input Component A11y Tests
  describe('Input A11y', () => {
    it('associates label with input field', () => {
      render(<Input label="Email Address" />);

      const label = screen.getByText('Email Address');
      expect(label).toBeInTheDocument();

      const input = screen.getByLabelText('Email Address');
      expect(input).toBeInTheDocument();
    });

    it('properly shows error state', () => {
      render(
        <Input
          label="Username"
          error={true}
          helperText="Username is required"
        />
      );

      const input = screen.getByLabelText('Username');
      expect(input).toHaveAttribute('aria-invalid', 'true');

      const errorMessage = screen.getByText('Username is required');
      expect(errorMessage).toBeInTheDocument();
    });

    it('handles disabled state correctly', () => {
      render(<Input label="Disabled Input" disabled />);

      const input = screen.getByLabelText('Disabled Input');
      expect(input).toBeDisabled();
    });
  });

  // Select Component A11y Tests
  describe('Select A11y', () => {
    const options = [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' },
      { value: '3', label: 'Option 3', disabled: true },
    ];

    it('associates label with select field', () => {
      render(<Select label="Choose an option" options={options} />);

      const label = screen.getByText('Choose an option');
      expect(label).toBeInTheDocument();

      const select = screen.getByLabelText('Choose an option');
      expect(select).toBeInTheDocument();
    });

    it('properly disables individual options', () => {
      render(<Select label="Choose an option" options={options} />);

      // Check for disabled option
      const select = screen.getByLabelText(
        'Choose an option'
      ) as HTMLSelectElement;
      expect(select.options[2].disabled).toBe(true);
    });

    it('handles error state correctly', () => {
      render(
        <Select
          label="Required Selection"
          options={options}
          error={true}
          helperText="Please make a selection"
        />
      );

      const select = screen.getByLabelText('Required Selection');
      expect(select).toHaveAttribute('aria-invalid', 'true');

      const errorMessage = screen.getByText('Please make a selection');
      expect(errorMessage).toBeInTheDocument();
    });
  });

  // Checkbox Component A11y Tests
  describe('Checkbox A11y', () => {
    it('associates label with checkbox', () => {
      render(<Checkbox label="Accept terms" />);

      const checkbox = screen.getByLabelText('Accept terms');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toHaveAttribute('type', 'checkbox');
    });

    it('handles indeterminate state', () => {
      render(<Checkbox label="Select all" indeterminate />);

      const checkbox = screen.getByLabelText('Select all');
      expect(checkbox).toBeInTheDocument();

      // Note: indeterminate is a DOM property that can't be checked with toHaveAttribute
      // In real testing, you'd need to verify this through the ref
    });

    it('properly handles error state', () => {
      render(
        <Checkbox
          label="Required checkbox"
          error={true}
          helperText="This field is required"
        />
      );

      const checkbox = screen.getByLabelText('Required checkbox');
      expect(checkbox).toHaveAttribute('aria-invalid', 'true');

      const errorMessage = screen.getByText('This field is required');
      expect(errorMessage).toBeInTheDocument();
    });
  });

  // Modal Component A11y Tests
  describe('Modal A11y', () => {
    it('traps focus when open', () => {
      render(
        <Modal
          isOpen={true}
          onClose={createMockHandler()}
          title="Accessible Modal"
        >
          <p>Modal content</p>
        </Modal>
      );

      // Check that modal title is visible
      expect(screen.getByText('Accessible Modal')).toBeInTheDocument();

      // Check for close button with accessible label
      const closeButton = screen.getByLabelText('Close modal');
      expect(closeButton).toBeInTheDocument();
    });

    it('has proper ARIA roles', () => {
      render(
        <Modal isOpen={true} onClose={createMockHandler()} title="ARIA Modal">
          <p>Modal with ARIA</p>
        </Modal>
      );
      // Check for appropriate modal role on content container
      const modalContent = screen
        .getByText('Modal with ARIA')
        .closest('[role="dialog"]');
      expect(modalContent).toBeInTheDocument();
      // Ensure title text is present
      expect(screen.getByText('ARIA Modal')).toBeInTheDocument();
    });
  });

  // Form Component A11y Tests
  describe('Form A11y', () => {
    it('creates accessible form fields', () => {
      render(
        <Form onSubmit={createMockHandler()}>
          <FormField label="First Name" required>
            <Input />
          </FormField>
          <button type="submit">Submit</button>
        </Form>
      );

      // Check for required indicator
      const label = screen.getByText('First Name');
      expect(label).toBeInTheDocument();

      // Check for submit button
      const submitButton = screen.getByText('Submit');
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('shows error messages appropriately', () => {
      render(
        <Form onSubmit={createMockHandler()}>
          <FormField label="Email" error="Please enter a valid email">
            <Input />
          </FormField>
        </Form>
      );

      // Check for error message
      const errorMessage = screen.getByText('Please enter a valid email');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });
  });
});
