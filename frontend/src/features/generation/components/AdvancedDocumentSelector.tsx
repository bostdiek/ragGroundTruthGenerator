import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { Document as AppDocument, Source } from '../../../types';
import RetrievalService from '../../retrieval/api/retrieval.service';
import GenerationDocumentSelector from './GenerationDocumentSelector';

interface AdvancedDocumentSelectorProps {
  selectedDocuments: AppDocument[];
  onDocumentSelectionChange: (documents: AppDocument[]) => void;
  onNextStep: () => void;
  onPreviousStep: () => void;
}

const Section = styled.section`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.3rem;
`;

const SearchContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  margin-bottom: 1rem;

  &:focus {
    outline: none;
    border-color: #0078d4;
    box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.2);
  }
`;

const Button = styled.button`
  background-color: #0078d4;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  margin-right: 1rem;

  &:hover {
    background-color: #106ebe;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(Button)`
  background-color: #f3f3f3;
  color: #333;
  border: 1px solid #ddd;

  &:hover {
    background-color: #e6e6e6;
  }
`;

const SourceTabs = styled.div`
  display: flex;
  margin-bottom: 1rem;
  border-bottom: 1px solid #ddd;
`;

const SourceTab = styled.button<{ active: boolean }>`
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  border-bottom: 2px solid
    ${props => (props.active ? '#0078d4' : 'transparent')};
  color: ${props => (props.active ? '#0078d4' : '#333')};
  font-weight: ${props => (props.active ? '500' : 'normal')};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #0078d4;
  }
`;

const ErrorMessage = styled.div`
  color: #d13438;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #fde7e9;
  border-radius: 4px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
`;

/**
 * Advanced Document Selector with search functionality
 */
const AdvancedDocumentSelector: React.FC<AdvancedDocumentSelectorProps> = ({
  selectedDocuments,
  onDocumentSelectionChange,
  onNextStep,
  onPreviousStep,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AppDocument[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [activeSource, setActiveSource] = useState<string>('all');
  // We're keeping this state as it might be used in future features
  const [metadataFilters] = useState<Record<string, any>>(
    {}
  );

  // Fetch sources on component mount
  useEffect(() => {
    const fetchSources = async () => {
      try {
        const response = await RetrievalService.getSources();
        // Since we're using the same types now, no conversion needed
        setSources(response.data);
      } catch (error) {
        console.error('Error fetching sources:', error);
      }
    };

    fetchSources();
  }, []);

  // Handle document search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      let filtersToUse: Record<string, any> = {};

      // Add source filter if not 'all'
      if (activeSource !== 'all') {
        filtersToUse.sourceIds = [activeSource];
      }

      // Add any other metadata filters
      if (Object.keys(metadataFilters).length > 0) {
        filtersToUse = { ...filtersToUse, ...metadataFilters };
      }

      const results = await RetrievalService.searchDocuments({
        query: searchQuery,
        filters: filtersToUse,
      });

      // Since we now have the correct type in our search results,
      // we can simply assign it without explicit conversion
      setSearchResults(results.documents);
    } catch (error) {
      console.error('Error searching documents:', error);
      setSearchError('Failed to search documents. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle document selection toggle
  const handleSelectDocument = (document: AppDocument) => {
    const isSelected = selectedDocuments.some(doc => doc.id === document.id);

    if (isSelected) {
      onDocumentSelectionChange(
        selectedDocuments.filter(doc => doc.id !== document.id)
      );
    } else {
      onDocumentSelectionChange([...selectedDocuments, document]);
    }
  };

  // Handle source tab change
  const handleSourceChange = (sourceId: string) => {
    setActiveSource(sourceId);
    setSearchResults([]);
  };

  return (
    <Section>
      <SectionTitle>Select relevant documents for your answer</SectionTitle>

      <SourceTabs>
        <SourceTab
          active={activeSource === 'all'}
          onClick={() => handleSourceChange('all')}
        >
          All Sources
        </SourceTab>

        {sources.map(source => (
          <SourceTab
            key={source.id}
            active={activeSource === source.id}
            onClick={() => handleSourceChange(source.id)}
          >
            {source.name}
          </SourceTab>
        ))}
      </SourceTabs>

      <SearchContainer>
        <SearchInput
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search for documents..."
          onKeyPress={e => e.key === 'Enter' && handleSearch()}
        />

        <Button onClick={handleSearch}>Search</Button>
      </SearchContainer>

      {searchError && <ErrorMessage>{searchError}</ErrorMessage>}

      {/* Use our GenerationDocumentSelector component for displaying search results */}
      <GenerationDocumentSelector
        documents={searchResults}
        selectedDocuments={selectedDocuments}
        onSelectDocument={handleSelectDocument}
        isLoading={isSearching}
        error={searchError}
      />

      {/* Display selected documents */}
      {selectedDocuments.length > 0 && (
        <>
          <SectionTitle>
            Selected Documents ({selectedDocuments.length})
          </SectionTitle>
          <GenerationDocumentSelector
            documents={selectedDocuments}
            selectedDocuments={selectedDocuments}
            onSelectDocument={handleSelectDocument}
            isLoading={false}
          />
        </>
      )}

      <ButtonContainer>
        <SecondaryButton onClick={onPreviousStep}>
          Back: Edit Question
        </SecondaryButton>

        <Button onClick={onNextStep} disabled={selectedDocuments.length === 0}>
          Next: Create Answer
        </Button>
      </ButtonContainer>
    </Section>
  );
};

export default AdvancedDocumentSelector;
