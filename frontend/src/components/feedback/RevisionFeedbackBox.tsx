import React from 'react';
import styled from 'styled-components';

// Styled component for the revision feedback box
const RevisionFeedbackContainer = styled.div`
  margin: 1.5rem 0;
  padding: 1.5rem;
  border-radius: 8px;
  background-color: #fff8e1;
  border-left: 4px solid #f57c00;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  
  /* Adding a visual indicator for revision feedback */
  &:before {
    content: '!';
    position: absolute;
    top: -10px;
    right: -10px;
    width: 28px;
    height: 28px;
    background-color: #f57c00;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 18px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  h4 {
    color: #f57c00;
    margin-top: 0;
    margin-bottom: 0.8rem;
    font-size: 1.2rem;
    font-weight: 600;
    display: flex;
    align-items: center;
  }

  p {
    color: #555;
    margin: 0 0 1rem 0;
    line-height: 1.6;
    font-size: 1.05rem;
    white-space: pre-line; /* Preserve line breaks in feedback */
    background-color: white;
    padding: 12px;
    border-radius: 4px;
    border: 1px solid #ffe0b2;
  }
`;

interface RevisionFeedbackBoxProps {
  title?: string;
  feedback: string;
  requestedBy?: string;
  requestedAt?: string;
  children?: React.ReactNode;
}

/**
 * RevisionFeedbackBox component
 * Displays revision feedback in a consistent way across the application
 */
const RevisionFeedbackBox: React.FC<RevisionFeedbackBoxProps> = ({
  title = 'Revision Feedback',
  feedback,
  requestedBy,
  requestedAt,
  children
}) => {
  return (
    <RevisionFeedbackContainer>
      <h4>{title}</h4>
      
      {requestedBy && (
        <small style={{ display: 'block', marginBottom: '0.75rem', color: '#666' }}>
          Requested by <strong>{requestedBy}</strong>
          {requestedAt && 
            ` on ${new Date(requestedAt).toLocaleString()}`}
        </small>
      )}
      
      <p>{feedback}</p>
      
      {children}
    </RevisionFeedbackContainer>
  );
};

export default RevisionFeedbackBox;
