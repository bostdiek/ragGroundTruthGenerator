/**
 * Utility functions for document filtering and sorting
 */

import { Document } from '../types/index';

/**
 * Filter documents based on metadata criteria
 * @param documents Array of documents to filter
 * @param filters Object with filter criteria
 * @returns Filtered array of documents
 */
export const filterDocumentsByMetadata = (
  documents: Document[],
  filters: Record<string, any>
): Document[] => {
  if (!filters || Object.keys(filters).length === 0) {
    return documents;
  }

  return documents.filter(document => {
    // Check each filter against the document metadata
    return Object.entries(filters).every(([key, value]) => {
      // Skip if filter value is undefined or null
      if (value === undefined || value === null) {
        return true;
      }

      const documentValue = document.metadata?.[key];

      // Handle array values (includes any match)
      if (Array.isArray(value)) {
        return value.some(v => documentValue === v);
      }

      // Handle string values (partial match)
      if (typeof documentValue === 'string' && typeof value === 'string') {
        return documentValue.toLowerCase().includes(value.toLowerCase());
      }

      // Handle exact match
      return documentValue === value;
    });
  });
};

/**
 * Sort documents by relevance or other criteria
 * @param documents Array of documents to sort
 * @param sortBy Sort field
 * @param sortDirection Sort direction ('asc' or 'desc')
 * @returns Sorted array of documents
 */
export const sortDocuments = (
  documents: Document[],
  sortBy: string = 'relevance_score',
  sortDirection: 'asc' | 'desc' = 'desc'
): Document[] => {
  return [...documents].sort((a, b) => {
    let valueA: any;
    let valueB: any;

    // Handle special case for relevance score
    if (sortBy === 'relevance_score') {
      // Use optional chaining with nullish coalescing for safety
      valueA = a.relevance_score ?? 0;
      valueB = b.relevance_score ?? 0;
    }
    // Handle sorting by metadata fields
    else if (sortBy.startsWith('metadata.')) {
      const metadataField = sortBy.replace('metadata.', '');
      valueA = a.metadata?.[metadataField];
      valueB = b.metadata?.[metadataField];
    }
    // Handle sorting by document fields
    else {
      valueA = (a as any)[sortBy];
      valueB = (b as any)[sortBy];
    }

    // Handle string comparison
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return sortDirection === 'asc'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }

    // Handle numeric comparison
    return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
  });
};
