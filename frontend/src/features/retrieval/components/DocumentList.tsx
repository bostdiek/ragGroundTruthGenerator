import React from 'react';
import styled from 'styled-components';

import { Document } from '../../../types';

interface DocumentListProps {
  documents: Document[];
  selectedDocuments?: Document[];
  onSelectDocument?: (document: Document) => void;
  isLoading?: boolean;
  error?: string | null;
}

const DocumentListContainer = styled.div`
  margin-bottom: 2rem;
`;

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  // Temporarily disabled props until implementation
  // selectedDocuments = [],
  // onSelectDocument,
  isLoading = false,
  error = null,
}) => {
  if (isLoading) {
    return <div>Loading documents...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  if (documents.length === 0) {
    return <div>No documents found</div>;
  }

  return (
    <DocumentListContainer>
      {/* Document list implementation will go here */}
      <div>Placeholder for document list component</div>
    </DocumentListContainer>
  );
};

export default DocumentList;
