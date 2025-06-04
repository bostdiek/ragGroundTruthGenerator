import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import QuestionInput from '../QuestionInput';

describe('QuestionInput', () => {
  it('renders correctly with initial question', () => {
    // Render component with props
    render(
      <QuestionInput
        question="Initial question"
        onQuestionChange={vi.fn()}
        onNextStep={vi.fn()}
      />
    );

    // Check that the question input is rendered with the correct value
    const textareaElement = screen.getByPlaceholderText(
      'Enter your question here...'
    );
    expect(textareaElement).toBeInTheDocument();
    expect(textareaElement).toHaveValue('Initial question');
  });

  it('calls onQuestionChange when input changes', () => {
    // Create a mock function for the onQuestionChange prop
    const mockOnQuestionChange = vi.fn();

    // Render component with props
    render(
      <QuestionInput
        question=""
        onQuestionChange={mockOnQuestionChange}
        onNextStep={vi.fn()}
      />
    );

    // Get the textarea element
    const textareaElement = screen.getByPlaceholderText(
      'Enter your question here...'
    );

    // Simulate user typing in the textarea
    fireEvent.change(textareaElement, { target: { value: 'New question' } });

    // Check that onQuestionChange was called with the new value
    expect(mockOnQuestionChange).toHaveBeenCalledWith('New question');
  });

  it('disables the next button when question is empty', () => {
    // Render component with an empty question
    render(
      <QuestionInput
        question=""
        onQuestionChange={vi.fn()}
        onNextStep={vi.fn()}
      />
    );

    // Check that the next button is disabled
    const nextButton = screen.getByText('Next: Select Documents');
    expect(nextButton).toBeDisabled();
  });

  it('enables the next button when question has content', () => {
    // Render component with a non-empty question
    render(
      <QuestionInput
        question="Valid question"
        onQuestionChange={vi.fn()}
        onNextStep={vi.fn()}
      />
    );

    // Check that the next button is enabled
    const nextButton = screen.getByText('Next: Select Documents');
    expect(nextButton).not.toBeDisabled();
  });

  it('calls onNextStep when the next button is clicked', () => {
    // Create a mock function for the onNextStep prop
    const mockOnNextStep = vi.fn();

    // Render component with a non-empty question
    render(
      <QuestionInput
        question="Valid question"
        onQuestionChange={vi.fn()}
        onNextStep={mockOnNextStep}
      />
    );

    // Get the next button and click it
    const nextButton = screen.getByText('Next: Select Documents');
    fireEvent.click(nextButton);

    // Check that onNextStep was called
    expect(mockOnNextStep).toHaveBeenCalled();
  });
});
