/**
 * Sorting utilities for documents
 */
import { Document, SortConfig } from '../types';

/**
 * Sort documents by a specific field and direction
 *
 * @param documents - Array of documents to sort
 * @param sortConfig - Sort configuration (field and direction)
 * @returns Sorted array of documents
 */
export const sortDocumentsByField = (
  documents: Document[],
  sortConfig: SortConfig
): Document[] => {
  const { field, direction } = sortConfig;

  return [...documents].sort((a, b) => {
    let valueA: any;
    let valueB: any;

    // Handle special case for relevance score
    if (field === 'relevance_score') {
      valueA = a.relevance_score || 0;
      valueB = b.relevance_score || 0;
    }
    // Handle sorting by metadata fields
    else if (field.startsWith('metadata.')) {
      const metadataField = field.replace('metadata.', '');
      valueA = a.metadata[metadataField];
      valueB = b.metadata[metadataField];
    }
    // Handle sorting by document fields
    else {
      valueA = getNestedPropertyValue(a, field);
      valueB = getNestedPropertyValue(b, field);
    }

    // Handle string comparison
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return direction === 'asc'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }

    // Handle date comparison
    if (valueA instanceof Date && valueB instanceof Date) {
      return direction === 'asc'
        ? valueA.getTime() - valueB.getTime()
        : valueB.getTime() - valueA.getTime();
    }

    // Handle numeric comparison
    return direction === 'asc' ? valueA - valueB : valueB - valueA;
  });
};

/**
 * Get nested property value from an object using dot notation
 *
 * @param obj - The object to get the value from
 * @param path - Path to the property using dot notation (e.g., 'source.name')
 * @returns The property value or undefined if not found
 */
const getNestedPropertyValue = (obj: any, path: string): any => {
  return path.split('.').reduce((previous, current) => {
    return previous ? previous[current] : undefined;
  }, obj);
};

/**
 * Get available sort options for documents
 *
 * @returns Array of sort options
 */
export const getDocumentSortOptions = (): Array<{
  value: string;
  label: string;
}> => {
  return [
    { value: 'relevance_score', label: 'Relevance' },
    { value: 'title', label: 'Title' },
    { value: 'source.name', label: 'Source' },
    { value: 'metadata.date', label: 'Date' },
  ];
};

/**
 * Default sort config for documents
 */
export const DEFAULT_SORT_CONFIG: SortConfig = {
  field: 'relevance_score',
  direction: 'desc',
};
