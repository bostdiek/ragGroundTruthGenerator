/**
 * CollectionFilters Component
 * 
 * This component provides filtering and sorting options for collections.
 */

import React from 'react';
import styled from 'styled-components';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { useCollectionsStore } from '../stores/collectionsStore';
import { CollectionFilters } from '../types';

// Styled components
const FiltersContainer = styled.div`
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
`;

const FilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 150px;
`;

/**
 * Collection Filters Component
 */
const CollectionFiltersComponent: React.FC = () => {
  const { 
    collectionFilters, 
    setCollectionFilters,
    collectionSortBy,
    collectionSortOrder,
    setCollectionSort,
    resetFilters
  } = useCollectionsStore();

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCollectionFilters({ search: e.target.value });
  };

  // Handle sort field change
  const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCollectionSort(
      e.target.value as CollectionFilters['sortBy'], 
      collectionSortOrder
    );
  };

  // Handle sort order change
  const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCollectionSort(
      collectionSortBy, 
      e.target.value as CollectionFilters['sortOrder']
    );
  };

  // Options for select components
  const sortByOptions = [
    { value: 'name', label: 'Name' },
    { value: 'created_at', label: 'Created Date' },
    { value: 'updated_at', label: 'Updated Date' },
    { value: 'document_count', label: 'Document Count' }
  ];

  const sortOrderOptions = [
    { value: 'asc', label: 'Ascending' },
    { value: 'desc', label: 'Descending' }
  ];

  return (
    <FiltersContainer>
      <FilterRow>
        <Input
          fullWidth
          placeholder="Search collections..."
          value={collectionFilters.search || ''}
          onChange={handleSearchChange}
        />
        
        <FilterGroup>
          <Select
            label="Sort By"
            options={sortByOptions}
            value={collectionSortBy || 'name'}
            onChange={handleSortByChange}
          />
        </FilterGroup>
        
        <FilterGroup>
          <Select
            label="Sort Order"
            options={sortOrderOptions}
            value={collectionSortOrder || 'asc'}
            onChange={handleSortOrderChange}
          />
        </FilterGroup>
        
        <Button 
          variant="secondary" 
          onClick={resetFilters}
        >
          Clear Filters
        </Button>
      </FilterRow>
    </FiltersContainer>
  );
};

export default CollectionFiltersComponent;
