import React from 'react';
import styled from 'styled-components';

import { Source } from '../../../types';

interface SourceSelectorProps {
  sources: Source[];
  selectedSources: string[];
  onSelectSource: (sourceId: string, isSelected: boolean) => void;
  isLoading?: boolean;
  error?: string | null;
}

const SourceSelectorContainer = styled.div`
  margin-bottom: 2rem;
`;

const SourceList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const SourceCard = styled.div<{ selected: boolean }>`
  padding: 1rem;
  border: 1px solid ${props => (props.selected ? '#1976d2' : '#ddd')};
  background-color: ${props => (props.selected ? '#e3f2fd' : '#fff')};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1 0 200px;
  max-width: 300px;

  &:hover {
    border-color: ${props => (props.selected ? '#1976d2' : '#aaa')};
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const SourceTitle = styled.h3`
  margin: 0 0 0.5rem;
  font-size: 1rem;
  color: #333;
`;

const SourceDescription = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: #666;
`;

const ErrorMessage = styled.div`
  color: #d32f2f;
  padding: 1rem;
  background-color: #ffebee;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

/**
 * Component for displaying and selecting data sources
 *
 * This component is part of the retrieval workflow and allows users to
 * select which data sources to search for relevant documents.
 */
const SourceSelector: React.FC<SourceSelectorProps> = ({
  sources,
  selectedSources,
  onSelectSource,
  isLoading = false,
  error = null,
}) => {
  if (isLoading) {
    return (
      <SourceSelectorContainer>
        <h2>Select Data Sources</h2>
        <p>Loading available data sources...</p>
        <SourceList>
          {[1, 2, 3].map(i => (
            <SourceCard key={i} selected={false} style={{ opacity: 0.5 }}>
              <SourceTitle>Loading...</SourceTitle>
              <SourceDescription>Please wait</SourceDescription>
            </SourceCard>
          ))}
        </SourceList>
      </SourceSelectorContainer>
    );
  }

  if (error) {
    return (
      <SourceSelectorContainer>
        <h2>Select Data Sources</h2>
        <ErrorMessage>
          <strong>Error loading data sources:</strong> {error}
        </ErrorMessage>
      </SourceSelectorContainer>
    );
  }

  if (sources.length === 0) {
    return (
      <SourceSelectorContainer>
        <h2>Select Data Sources</h2>
        <p>No data sources are currently available.</p>
      </SourceSelectorContainer>
    );
  }

  return (
    <SourceSelectorContainer>
      <h2>Select Data Sources</h2>
      <p>Choose which data sources to search for relevant documents</p>
      <SourceList>
        {sources.map(source => {
          const isSelected = selectedSources.includes(source.id);
          return (
            <SourceCard
              key={source.id}
              selected={isSelected}
              onClick={() => onSelectSource(source.id, !isSelected)}
              data-testid={
                isSelected ? 'source-card-selected' : 'source-card-unselected'
              }
            >
              <SourceTitle>{source.name}</SourceTitle>
              <SourceDescription>{source.description}</SourceDescription>
            </SourceCard>
          );
        })}
      </SourceList>
    </SourceSelectorContainer>
  );
};

export default SourceSelector;
