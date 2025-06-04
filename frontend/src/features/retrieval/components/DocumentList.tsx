import React from 'react';
import styled from 'styled-components';

import { Document } from '../../../types';

interface DocumentListProps {
  documents: Document[];
  selectedDocuments?: Document[];
  onSelectDocument?: (document: Document, isSelected: boolean) => void;
  isLoading?: boolean;
  error?: string | null;
}

const DocumentListContainer = styled.div`
  margin-bottom: 2rem;
`;

const DocumentListHeader = styled.h3`
  margin-top: 0;
  margin-bottom: 1rem;
`;

const DocumentListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const DocumentItem = styled.div<{ selected: boolean }>`
  display: flex;
  padding: 1rem;
  border: 1px solid ${props => (props.selected ? '#1976d2' : '#ddd')};
  background-color: ${props => (props.selected ? '#e3f2fd' : '#fff')};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => (props.selected ? '#1976d2' : '#aaa')};
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const DocumentCheckbox = styled.div`
  flex: 0 0 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.5rem;
`;

const DocumentInfo = styled.div`
  flex: 1;
`;

const DocumentTitle = styled.div`
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const DocumentSource = styled.div`
  font-size: 0.875rem;
  color: #666;
`;

const ErrorMessage = styled.div`
  color: #d32f2f;
  padding: 1rem;
  background-color: #ffebee;
  border-radius: 4px;
`;

/**
 * Component for displaying and selecting documents
 */
const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  selectedDocuments = [],
  onSelectDocument,
  isLoading = false,
  error = null,
}) => {
  // Check if a document is selected
  const isSelected = (document: Document) => {
    return selectedDocuments.some(doc => doc.id === document.id);
  };

  if (isLoading) {
    return <div>Loading documents...</div>;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  if (documents.length === 0) {
    return <div>No documents found</div>;
  }

  return (
    <DocumentListContainer>
      <DocumentListHeader>Available Documents</DocumentListHeader>
      <DocumentListWrapper>
        {documents.map(document => (
          <DocumentItem
            key={document.id}
            selected={isSelected(document)}
            onClick={() =>
              onSelectDocument &&
              onSelectDocument(document, !isSelected(document))
            }
          >
            <DocumentCheckbox>
              {isSelected(document) && <span>✓</span>}
            </DocumentCheckbox>
            <DocumentInfo>
              <DocumentTitle>{document.title}</DocumentTitle>
              <DocumentSource>
                {document.source?.name || 'Unknown source'}
              </DocumentSource>
            </DocumentInfo>
          </DocumentItem>
        ))}
      </DocumentListWrapper>
    </DocumentListContainer>
  );
};

export default DocumentList;
