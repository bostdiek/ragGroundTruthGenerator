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

const SourceSelector: React.FC<SourceSelectorProps> = ({
  sources,
  // Temporarily disabled props until implementation
  // selectedSources,
  // onSelectSource,
  isLoading = false,
  error = null,
}) => {
  if (isLoading) {
    return <div>Loading sources...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  if (sources.length === 0) {
    return <div>No data sources available</div>;
  }

  return (
    <SourceSelectorContainer>
      {/* Source selector implementation will go here */}
      <div>Placeholder for source selector component</div>
    </SourceSelectorContainer>
  );
};

export default SourceSelector;
