import React from 'react';
import styled from 'styled-components';

import { Document } from '../../../types';
import { useRetrievalContext } from '../context/RetrievalContext';
import DocumentList from './DocumentList';
import SourceSelector from './SourceSelector';

interface RetrievalSelectorProps {
  question: string;
  onDocumentsSelected?: (documents: Document[]) => void;
}

const RetrievalSelectorContainer = styled.div`
  margin-bottom: 2rem;
`;

const SectionDivider = styled.div`
  height: 1px;
  background-color: #eee;
  margin: 2rem 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    background-color: #1565c0;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

/**
 * Component that combines source selection and document retrieval functionality
 */
const RetrievalSelector: React.FC<RetrievalSelectorProps> = ({
  question,
  onDocumentsSelected,
}) => {
  const {
    sources,
    isLoadingSources,
    sourcesError,
    selectedSources,
    selectSource,

    documents,
    isLoadingDocuments,
    documentsError,
    selectedDocuments,
    selectDocument,

    fetchRecommendedDocuments,
  } = useRetrievalContext();

  const handleFindDocuments = async () => {
    if (!question || selectedSources.length === 0) return;

    await fetchRecommendedDocuments(question);
  };

  const handleFinishSelection = () => {
    if (onDocumentsSelected && selectedDocuments.length > 0) {
      onDocumentsSelected(selectedDocuments);
    }
  };

  return (
    <RetrievalSelectorContainer>
      <SourceSelector
        sources={sources}
        selectedSources={selectedSources}
        onSelectSource={selectSource}
        isLoading={isLoadingSources}
        error={sourcesError}
      />

      <ButtonContainer>
        <Button
          onClick={handleFindDocuments}
          disabled={selectedSources.length === 0 || !question}
        >
          Find Relevant Documents
        </Button>
      </ButtonContainer>

      {(documents.length > 0 || isLoadingDocuments || documentsError) && (
        <>
          <SectionDivider />

          <DocumentList
            documents={documents}
            selectedDocuments={selectedDocuments}
            onSelectDocument={selectDocument}
            isLoading={isLoadingDocuments}
            error={documentsError}
          />

          <ButtonContainer>
            <Button
              onClick={handleFinishSelection}
              disabled={selectedDocuments.length === 0}
            >
              Use Selected Documents
            </Button>
          </ButtonContainer>
        </>
      )}
    </RetrievalSelectorContainer>
  );
};

export default RetrievalSelector;
