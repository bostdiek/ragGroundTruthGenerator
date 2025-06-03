import React, { useState } from 'react';
import styled from 'styled-components';

interface RevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comments: string) => void;
  isSubmitting: boolean;
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 8px;
  max-width: 600px;
  width: 100%;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  margin: 0;
  color: #333;
`;

const ModalBody = styled.div`
  margin-bottom: 1.5rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 150px;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #0078d4;
    box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.2);
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const Button = styled.button`
  background-color: #0078d4;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  
  &:hover {
    background-color: #106ebe;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const CancelButton = styled(Button)`
  background-color: transparent;
  color: #333;
  border: 1px solid #ddd;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const RevisionModal: React.FC<RevisionModalProps> = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [comments, setComments] = useState('');
  
  const handleSubmit = () => {
    onSubmit(comments);
  };
  
  if (!isOpen) return null;
  
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Request Revision</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <p>Please provide specific directions for what needs to be revised:</p>
          <TextArea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Enter revision instructions here..."
            autoFocus
          />
        </ModalBody>
        <ModalFooter>
          <CancelButton onClick={onClose} disabled={isSubmitting}>
            Cancel
          </CancelButton>
          <Button onClick={handleSubmit} disabled={isSubmitting || !comments.trim()}>
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

export default RevisionModal;
