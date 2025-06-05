import React from 'react';
import styled from 'styled-components';

import DocumentCard from '../../../components/ui/DocumentCard';
import { Document } from '../../../types';

interface SelectedDocumentsDisplayProps {
  documents: Document[];
}

const Container = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.3rem;
`;

const DocumentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }

  @media (min-width: 1200px) {
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  }
`;

const CompactDocumentCard = ({ doc }: { doc: Document }) => {
  return (
    <div style={{ height: '100%' }}>
      <DocumentCard doc={doc} />
    </div>
  );
};

const EmptyState = styled.div`
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 4px;
  color: #666;
`;

/**
 * Component for displaying selected documents in a grid layout
 */
const SelectedDocumentsDisplay: React.FC<SelectedDocumentsDisplayProps> = ({
  documents,
}) => {
  if (documents.length === 0) {
    return (
      <Container>
        <SectionTitle>Selected Documents</SectionTitle>
        <EmptyState>No documents selected for this question.</EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <SectionTitle>Selected Documents ({documents.length})</SectionTitle>
      <DocumentsGrid>
        {documents.map((document, index) => (
          <CompactDocumentCard key={index} doc={document} />
        ))}
      </DocumentsGrid>
    </Container>
  );
};

export default SelectedDocumentsDisplay;
