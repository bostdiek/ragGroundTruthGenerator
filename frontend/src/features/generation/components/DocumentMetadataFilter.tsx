import React, { useState } from 'react';
import styled from 'styled-components';
import { Document } from '../../../types';

interface MetadataField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  options?: string[]; // For select type
}

interface MetadataFilterProps {
  documents: Document[];
  metadataFields?: MetadataField[];
  onFilterChange: (filters: Record<string, any>) => void;
}

const FilterContainer = styled.div`
  margin-bottom: 1.5rem;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 1rem;
`;

const FilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const FilterTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  color: #333;
`;

const FilterControls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const FilterField = styled.div`
  flex: 1;
  min-width: 200px;
`;

const FilterLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #666;
`;

const FilterInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #0078d4;
  }
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #0078d4;
  }
`;

const ResetButton = styled.button`
  background: none;
  border: none;
  color: #0078d4;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0;
  
  &:hover {
    text-decoration: underline;
  }
`;

/**
 * Component for filtering documents based on metadata fields.
 * This component is designed to be extensible so teams can add their own custom filters.
 */
const DocumentMetadataFilter: React.FC<MetadataFilterProps> = ({
  documents,
  metadataFields = [],
  onFilterChange,
}) => {
  const [filters, setFilters] = useState<Record<string, any>>({});

  // Extract available metadata fields from documents if not provided
  const getAvailableMetadataFields = (): MetadataField[] => {
    if (metadataFields && metadataFields.length > 0) {
      return metadataFields;
    }

    // Auto-detect metadata fields from documents
    const fieldsMap = new Map<string, Set<any>>();
    
    documents.forEach(doc => {
      if (doc.metadata) {
        Object.entries(doc.metadata).forEach(([key, value]) => {
          if (!fieldsMap.has(key)) {
            fieldsMap.set(key, new Set());
          }
          fieldsMap.get(key)?.add(value);
        });
      }
    });
    
    return Array.from(fieldsMap.entries()).map(([key, values]) => {
      const valuesArray = Array.from(values);
      
      // Determine field type based on values
      let type: 'text' | 'number' | 'date' | 'boolean' | 'select' = 'text';
      let options: string[] | undefined = undefined;
      
      if (valuesArray.length > 0) {
        const firstValue = valuesArray[0];
        
        if (typeof firstValue === 'number') {
          type = 'number';
        } else if (typeof firstValue === 'boolean') {
          type = 'boolean';
        } else if (
          typeof firstValue === 'string' && 
          /^\d{4}-\d{2}-\d{2}/.test(firstValue)
        ) {
          type = 'date';
        } else if (valuesArray.length <= 10) {
          // If there are few distinct values, use a select input
          type = 'select';
          options = valuesArray.map(v => String(v));
        }
      }
      
      return {
        key,
        label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        type,
        options
      };
    });
  };
  
  const availableFields = getAvailableMetadataFields();
  
  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters };
    
    if (value === '' || value === undefined) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  const resetFilters = () => {
    setFilters({});
    onFilterChange({});
  };
  
  if (availableFields.length === 0) {
    return null;
  }

  return (
    <FilterContainer>
      <FilterHeader>
        <FilterTitle>Filter by Metadata</FilterTitle>
        {Object.keys(filters).length > 0 && (
          <ResetButton onClick={resetFilters}>
            Reset Filters
          </ResetButton>
        )}
      </FilterHeader>
      
      <FilterControls>
        {availableFields.map(field => (
          <FilterField key={field.key}>
            <FilterLabel htmlFor={`filter-${field.key}`}>
              {field.label}
            </FilterLabel>
            
            {field.type === 'select' && field.options ? (
              <FilterSelect
                id={`filter-${field.key}`}
                value={filters[field.key] || ''}
                onChange={(e) => handleFilterChange(field.key, e.target.value)}
              >
                <option value="">All</option>
                {field.options.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </FilterSelect>
            ) : field.type === 'boolean' ? (
              <FilterSelect
                id={`filter-${field.key}`}
                value={filters[field.key] || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  handleFilterChange(field.key, value === '' ? '' : value === 'true');
                }}
              >
                <option value="">All</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </FilterSelect>
            ) : (
              <FilterInput
                id={`filter-${field.key}`}
                type={field.type}
                value={filters[field.key] || ''}
                onChange={(e) => handleFilterChange(field.key, e.target.value)}
                placeholder={`Filter by ${field.label.toLowerCase()}...`}
              />
            )}
          </FilterField>
        ))}
      </FilterControls>
    </FilterContainer>
  );
};

export default DocumentMetadataFilter;
