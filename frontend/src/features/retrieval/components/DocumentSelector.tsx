import React from 'react';
import styled from 'styled-components';

import { Document } from '../types';

interface DocumentSelectorProps {
  documents: Document[];
  selectedDocuments: Document[];
  onSelectDocument: (document: Document) => void;
  isLoading?: boolean;
  error?: string | null;
}

const DocumentSelectorContainer = styled.div`
  margin-bottom: 2rem;
`;

const DocumentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
`;

const DocumentItem = styled.div<{ selected: boolean }>`
  padding: 1rem;
  border: 1px solid ${props => (props.selected ? '#1976d2' : '#ddd')};
  background-color: ${props => (props.selected ? '#e3f2fd' : '#fff')};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => (props.selected ? '#1976d2' : '#aaa')};
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const DocumentTitle = styled.h3`
  margin: 0 0 0.5rem;
  font-size: 1rem;
  color: #333;
`;

const DocumentContent = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

const ErrorMessage = styled.div`
  color: #d32f2f;
  padding: 1rem;
  background-color: #ffebee;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

/**
 * Component for displaying and selecting documents
 *
 * This component is part of the retrieval workflow and allows users to
 * select documents from a list of search results.
 */
const DocumentSelector: React.FC<DocumentSelectorProps> = ({
  documents,
  selectedDocuments,
  onSelectDocument,
  isLoading = false,
  error = null,
}) => {
  if (isLoading) {
    return (
      <DocumentSelectorContainer>
        <p>Loading documents...</p>
        <DocumentList>
          {[1, 2, 3].map(i => (
            <DocumentItem key={i} selected={false} style={{ opacity: 0.5 }}>
              <DocumentTitle>Loading...</DocumentTitle>
              <DocumentContent>Please wait</DocumentContent>
            </DocumentItem>
          ))}
        </DocumentList>
      </DocumentSelectorContainer>
    );
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  if (documents.length === 0) {
    return <div>No documents available</div>;
  }

  return (
    <DocumentSelectorContainer>
      <DocumentList>
        {documents.map(document => (
          <DocumentItem
            key={document.id}
            selected={selectedDocuments.some(doc => doc.id === document.id)}
            onClick={() => onSelectDocument(document)}
          >
            <DocumentTitle>{document.title}</DocumentTitle>
            <DocumentContent>{document.content}</DocumentContent>
          </DocumentItem>
        ))}
      </DocumentList>
    </DocumentSelectorContainer>
  );
};

export default DocumentSelector;
