import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { Input, Select } from '../../../components';
import { SelectOption } from '../../../components/ui/Select';
import {
  borderRadius,
  colors,
  spacing,
  transitions,
  typography,
} from '../../../components/ui/theme';
import { Document } from '../../../types';
import useRetrievalStore from '../stores/retrievalStore';
import {
  filterDocumentsByMetadata,
  getAvailableMetadataFields,
  getUniqueMetadataValues,
  searchDocuments,
  sortDocuments,
} from '../utils/documentUtils';
import { getDocumentSortOptions } from '../utils/sortingUtils';

// Props interface for DocumentTabControls
interface DocumentTabControlsProps {
  documents: Document[];
  onFilteredDocuments: (filtered: Document[]) => void;
  sourceId: string;
}

// Filter state interface
interface FilterState {
  searchText: string;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  filters: Record<string, string>;
}

// Styled components
const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
  padding: ${spacing.md};
  background-color: ${colors.background.paper};
  border: 1px solid ${colors.grey[200]};
  border-radius: ${borderRadius.md};
  margin-bottom: ${spacing.md};
`;

const MainControlsRow = styled.div`
  display: flex;
  gap: ${spacing.md};
  align-items: flex-end;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FilterToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  margin-top: ${spacing.sm};
`;

const FilterToggleButton = styled.button<{ active: boolean }>`
  padding: ${spacing.sm} ${spacing.md};
  border: 1px solid ${colors.grey[300]};
  border-radius: ${borderRadius.md};
  background-color: ${props =>
    props.active ? colors.primary.main : colors.common.white};
  color: ${props => (props.active ? colors.common.white : colors.text.primary)};
  font-family: ${typography.fontFamily.primary};
  font-size: ${typography.fontSize.sm};
  cursor: pointer;
  transition: all ${transitions.duration.short} ${transitions.easing.easeInOut};
  display: flex;
  align-items: center;
  gap: ${spacing.xs};

  &:hover {
    background-color: ${props =>
      props.active ? colors.primary.dark : colors.grey[50]};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${colors.primary.main}20;
  }

  .icon {
    transition: transform ${transitions.duration.short}
      ${transitions.easing.easeInOut};
    transform: ${props => (props.active ? 'rotate(180deg)' : 'rotate(0deg)')};
  }
`;

const SearchGroup = styled.div`
  flex: 2;
  min-width: 200px;
`;

const SortGroup = styled.div`
  display: flex;
  gap: ${spacing.sm};
  align-items: flex-end; // Changed back to flex-end for proper alignment with input field
  flex: 1;
  min-width: 200px;
`;

const SortDirectionButton = styled.button<{ active: boolean }>`
  padding: ${spacing.sm};
  border: 1px solid ${colors.grey[300]};
  border-radius: ${borderRadius.md};
  background-color: ${props =>
    props.active ? colors.primary.main : colors.common.white};
  color: ${props => (props.active ? colors.common.white : colors.text.primary)};
  font-family: ${typography.fontFamily.primary};
  font-size: ${typography.fontSize.md};
  cursor: pointer;
  transition: all ${transitions.duration.short} ${transitions.easing.easeInOut};
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  align-self: center; // Added to position the button vertically centered
  margin-bottom: 4px; // Adjusted margin to match the input field's bottom margin

  &:hover {
    background-color: ${props =>
      props.active ? colors.primary.dark : colors.grey[50]};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${colors.primary.main}20;
  }
`;

const FiltersRow = styled.div`
  display: flex;
  gap: ${spacing.md};
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FilterGroup = styled.div`
  min-width: 150px;
  flex: 1;
`;

const ResultsCount = styled.div`
  font-family: ${typography.fontFamily.primary};
  font-size: ${typography.fontSize.sm};
  color: ${colors.text.secondary};
  padding: ${spacing.sm} 0;
`;

/**
 * DocumentTabControls component provides search, sort, and filter functionality
 * for documents within a specific data source tab.
 */
const DocumentTabControls: React.FC<DocumentTabControlsProps> = ({
  documents,
  onFilteredDocuments,
  sourceId,
}) => {
  const { tabFilters, setTabFilter } = useRetrievalStore();

  // State for showing/hiding filter controls
  const [showFilters, setShowFilters] = useState(false);

  // Get current filter state for this tab, with defaults
  const currentTabFilter = useMemo(() => {
    const defaults = {
      searchText: '',
      sortBy: 'relevance',
      sortDirection: 'desc' as const,
      filters: {},
    };

    return {
      ...defaults,
      ...tabFilters[sourceId],
    };
  }, [tabFilters, sourceId]);

  const [filterState, setFilterState] = useState<FilterState>(currentTabFilter);

  // Update local state when store state changes
  useEffect(() => {
    setFilterState(currentTabFilter);
  }, [currentTabFilter]);

  // Get available metadata fields from documents
  const availableMetadataFields = useMemo(() => {
    return getAvailableMetadataFields(documents);
  }, [documents]);

  // Create filter options for each available metadata field
  const availableFilters = useMemo(() => {
    const filters: Record<string, SelectOption[]> = {};

    availableMetadataFields.forEach(field => {
      // Create default option
      const options = [
        { value: '', label: `All ${field}s` },
        // Add options from document metadata values
        ...getUniqueMetadataValues(documents, field).map(value => ({
          value,
          label: value,
        })),
      ];

      filters[field] = options;
    });

    return filters;
  }, [documents, availableMetadataFields]);

  // Define sort options
  const sortOptions = useMemo(() => {
    return getDocumentSortOptions();
  }, []);

  // Convert sort options to select options
  const selectSortOptions = useMemo(() => {
    return sortOptions.map(opt => ({
      value: opt.value,
      label: opt.label,
    }));
  }, [sortOptions]);

  // Filter and sort documents based on current state
  const filteredDocuments = useMemo(() => {
    let result = [...documents];

    // Apply text search
    if (filterState.searchText.trim()) {
      result = searchDocuments(
        result,
        filterState.searchText,
        ['title', 'content'] // Default fields to search
      );
    }

    // Apply metadata filters
    if (Object.keys(filterState.filters).length > 0) {
      // Only pass non-empty filter values
      const activeFilters = Object.entries(filterState.filters)
        .filter(([, value]) => value && value.trim() !== '')
        .reduce(
          (acc, [key, value]) => {
            acc[key] = value;
            return acc;
          },
          {} as Record<string, string>
        );

      if (Object.keys(activeFilters).length > 0) {
        result = filterDocumentsByMetadata(result, activeFilters);
      }
    }

    // Apply sorting
    return sortDocuments(result, filterState.sortBy, filterState.sortDirection);
  }, [documents, filterState]);

  // Update parent component when filtered documents change
  useEffect(() => {
    onFilteredDocuments(filteredDocuments);
  }, [filteredDocuments, onFilteredDocuments]);

  // Handle search text change
  const handleSearchChange = (value: string) => {
    const newState = {
      ...filterState,
      searchText: value,
    };
    setFilterState(newState);
    setTabFilter(sourceId, newState);
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    const newState = {
      ...filterState,
      sortBy: value,
    };
    setFilterState(newState);
    setTabFilter(sourceId, newState);
  };

  // Handle sort direction toggle
  const handleSortDirectionToggle = () => {
    const newState = {
      ...filterState,
      sortDirection:
        filterState.sortDirection === 'asc'
          ? ('desc' as const)
          : ('asc' as const),
    };
    setFilterState(newState);
    setTabFilter(sourceId, newState);
  };

  // Handle filter change
  const handleFilterChange = (key: string, value: string) => {
    const newState = {
      ...filterState,
      filters: {
        ...filterState.filters,
        [key]: value,
      },
    };
    setFilterState(newState);
    setTabFilter(sourceId, newState);
  };

  // Reset all filters
  const handleResetFilters = () => {
    const newState = {
      searchText: '',
      sortBy: 'relevance',
      sortDirection: 'desc' as const,
      filters: {},
    };
    setFilterState(newState);
    setTabFilter(sourceId, newState);
  };

  const hasActiveFilters =
    filterState.searchText.trim() !== '' ||
    Object.values(filterState.filters).some(value => value.trim() !== '');

  const hasAvailableFilters = Object.keys(availableFilters).length > 0;

  return (
    <ControlsContainer>
      <MainControlsRow>
        <SearchGroup>
          <Input
            label="Search documents"
            placeholder="Search by title, content, or metadata..."
            value={filterState.searchText}
            onChange={e => handleSearchChange(e.target.value)}
            fullWidth
          />
        </SearchGroup>

        <SortGroup>
          <div style={{ flex: 1 }}>
            <Select
              label="Sort by"
              value={filterState.sortBy}
              onChange={e => handleSortChange(e.target.value)}
              options={selectSortOptions}
              fullWidth
            />
          </div>
          <SortDirectionButton
            active={filterState.sortDirection === 'asc'}
            onClick={handleSortDirectionToggle}
            title={`Sort ${filterState.sortDirection === 'asc' ? 'ascending' : 'descending'}`}
          >
            {filterState.sortDirection === 'asc' ? '↑' : '↓'}
          </SortDirectionButton>
        </SortGroup>
      </MainControlsRow>

      {hasAvailableFilters && (
        <FilterToggleContainer>
          <FilterToggleButton
            active={showFilters}
            onClick={() => setShowFilters(!showFilters)}
          >
            <span className="icon">▼</span>
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            {hasActiveFilters && !showFilters && (
              <span
                style={{
                  backgroundColor: colors.primary.main,
                  color: colors.common.white,
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  marginLeft: spacing.xs,
                }}
              >
                {
                  Object.values(filterState.filters).filter(
                    value => value.trim() !== ''
                  ).length
                }
              </span>
            )}
          </FilterToggleButton>
        </FilterToggleContainer>
      )}

      {showFilters && hasAvailableFilters && (
        <FiltersRow>
          {Object.entries(availableFilters).map(([key, options]) => (
            <FilterGroup key={key}>
              <Select
                label={`Filter by ${key}`}
                value={filterState.filters[key] || ''}
                onChange={e => handleFilterChange(key, e.target.value)}
                options={options}
                fullWidth
              />
            </FilterGroup>
          ))}
          {hasActiveFilters && (
            <FilterGroup>
              <button
                onClick={handleResetFilters}
                style={{
                  padding: '8px 16px',
                  border: `1px solid ${colors.grey[300]}`,
                  borderRadius: borderRadius.md,
                  backgroundColor: colors.common.white,
                  color: colors.text.primary,
                  cursor: 'pointer',
                  fontFamily: typography.fontFamily.primary,
                  fontSize: typography.fontSize.sm,
                  marginTop: '20px',
                }}
              >
                Reset Filters
              </button>
            </FilterGroup>
          )}
        </FiltersRow>
      )}

      <ResultsCount>
        Showing {filteredDocuments.length} of {documents.length} documents
      </ResultsCount>
    </ControlsContainer>
  );
};

export default DocumentTabControls;
