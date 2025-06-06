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
  sortBy = 'relevance_score',
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

/**
 * Search documents by text across multiple fields
 * @param documents Array of documents to search
 * @param query Search query string
 * @param fields Fields to search in (defaults to title, content, and metadata)
 * @returns Filtered array of documents matching the search query
 */
export const searchDocuments = (
  documents: Document[],
  query: string,
  fields: string[] = ['title', 'content']
): Document[] => {
  if (!query.trim()) {
    return documents;
  }

  const searchTerms = query
    .toLowerCase()
    .split(' ')
    .filter(term => term.length > 0);

  return documents.filter(doc => {
    // Build searchable content
    const searchableContent: string[] = [];

    // Add specified fields
    fields.forEach(field => {
      if (field.includes('.')) {
        // Handle nested fields like 'source.name'
        const [parent, child] = field.split('.');
        const value = (doc as any)[parent]?.[child];
        if (typeof value === 'string') {
          searchableContent.push(value);
        }
      } else {
        // Handle direct fields
        const value = (doc as any)[field];
        if (typeof value === 'string') {
          searchableContent.push(value);
        }
      }
    });

    // Include metadata values in search
    if (doc.metadata) {
      Object.values(doc.metadata).forEach(value => {
        if (typeof value === 'string') {
          searchableContent.push(value);
        }
      });
    }

    const combinedContent = searchableContent.join(' ').toLowerCase();
    return searchTerms.every(term => combinedContent.includes(term));
  });
};

/**
 * Get unique values for a specific metadata field across all documents
 * @param documents Array of documents
 * @param field Metadata field name
 * @returns Array of unique values sorted alphabetically
 */
export const getUniqueMetadataValues = (
  documents: Document[],
  field: string
): string[] => {
  const values = new Set<string>();

  documents.forEach(doc => {
    const value = doc.metadata?.[field];
    if (typeof value === 'string' && value.trim()) {
      values.add(value);
    }
  });

  return Array.from(values).sort();
};

/**
 * Get all available metadata fields across documents
 * @param documents Array of documents
 * @returns Array of metadata field names
 */
export const getAvailableMetadataFields = (documents: Document[]): string[] => {
  const fields = new Set<string>();

  documents.forEach(doc => {
    if (doc.metadata) {
      Object.keys(doc.metadata).forEach(key => {
        if (typeof doc.metadata![key] === 'string') {
          fields.add(key);
        }
      });
    }
  });

  return Array.from(fields).sort();
};
