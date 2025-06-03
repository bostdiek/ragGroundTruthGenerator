import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '../components/ui/Modal';

// Mock jest/vitest functions
const createMockFn = () => {
  if (typeof jest !== 'undefined') {
    return jest.fn();
  }
  if (typeof vi !== 'undefined') {
    return vi.fn();
  }
  return function mockFn() {};
};

describe('Modal Component', () => {
  it('renders when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    );
    
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    );
    
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = createMockFn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    );
    
    // Find the close button and click it
    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);
    
    // Check that onClose was called
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when overlay is clicked and closeOnOutsideClick is true', () => {
    const handleClose = createMockFn();
    render(
      <Modal isOpen={true} onClose={handleClose} closeOnOutsideClick={true}>
        <div>Modal Content</div>
      </Modal>
    );
    
    // Find the overlay (parent of the modal content)
    // Note: This is implementation-specific and might need adjustment
    const modalContent = screen.getByText('Modal Content');
    const overlay = modalContent.parentElement?.parentElement;
    
    if (overlay) {
      fireEvent.click(overlay);
      expect(handleClose).toHaveBeenCalledTimes(1);
    }
  });

  it('does not call onClose when overlay is clicked and closeOnOutsideClick is false', () => {
    const handleClose = createMockFn();
    render(
      <Modal isOpen={true} onClose={handleClose} closeOnOutsideClick={false}>
        <div>Modal Content</div>
      </Modal>
    );
    
    // Find the overlay (parent of the modal content)
    // Note: This is implementation-specific and might need adjustment
    const modalContent = screen.getByText('Modal Content');
    const overlay = modalContent.parentElement?.parentElement;
    
    if (overlay) {
      fireEvent.click(overlay);
      expect(handleClose).not.toHaveBeenCalled();
    }
  });

  it('renders with different sizes', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={() => {}} size="small">
        <div>Small Modal</div>
      </Modal>
    );
    
    expect(screen.getByText('Small Modal')).toBeInTheDocument();
    
    rerender(
      <Modal isOpen={true} onClose={() => {}} size="medium">
        <div>Medium Modal</div>
      </Modal>
    );
    
    expect(screen.getByText('Medium Modal')).toBeInTheDocument();
    
    rerender(
      <Modal isOpen={true} onClose={() => {}} size="large">
        <div>Large Modal</div>
      </Modal>
    );
    
    expect(screen.getByText('Large Modal')).toBeInTheDocument();
  });

  it('renders with footer content when provided', () => {
    render(
      <Modal 
        isOpen={true} 
        onClose={() => {}} 
        footer={<button>Save Changes</button>}
      >
        <div>Modal with Footer</div>
      </Modal>
    );
    
    expect(screen.getByText('Modal with Footer')).toBeInTheDocument();
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });
});
