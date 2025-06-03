import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renders application title', () => {
  render(<App />);
  // Use getAllByText since there are multiple elements with the same text
  const titleElements = screen.getAllByText(/AI Ground Truth Generator/i);
  // Check that at least one title element exists
  expect(titleElements.length).toBeGreaterThan(0);
});
