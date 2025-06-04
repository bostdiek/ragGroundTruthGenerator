/**
 * Filtering utilities for documents
 */
import { Document, RetrievalFilters } from '../types/index';

/**
 * Filter documents based on filter criteria
 *
 * @param documents - Array of documents to filter
 * @param filters - Filter criteria
 * @returns Filtered array of documents
 */
export const filterDocuments = (
  documents: Document[],
  filters: RetrievalFilters
): Document[] => {
  if (!filters || Object.keys(filters).length === 0) {
    return documents;
  }

  return documents.filter(doc => {
    // Filter by source IDs
    if (filters.sourceIds && filters.sourceIds.length > 0) {
      if (
        !doc.source ||
        !doc.source.id ||
        !filters.sourceIds.includes(doc.source.id)
      ) {
        return false;
      }
    }

    // Filter by date range
    if (filters.dateRange) {
      const docDate = doc.metadata?.date ? new Date(doc.metadata.date) : null;

      if (docDate) {
        if (filters.dateRange.from) {
          const fromDate = new Date(filters.dateRange.from);
          if (docDate < fromDate) {
            return false;
          }
        }

        if (filters.dateRange.to) {
          const toDate = new Date(filters.dateRange.to);
          if (docDate > toDate) {
            return false;
          }
        }
      }
    }

    // Filter by document types
    if (filters.documentTypes && filters.documentTypes.length > 0) {
      const docType = doc.metadata?.type || doc.metadata?.documentType;
      if (!docType || !filters.documentTypes.includes(docType)) {
        return false;
      }
    }

    // Process any custom filters (those not explicitly handled above)
    return Object.entries(filters)
      .filter(
        ([key]) => !['sourceIds', 'dateRange', 'documentTypes'].includes(key)
      )
      .every(([key, value]) => {
        // Skip if filter value is undefined or null
        if (value === undefined || value === null) {
          return true;
        }

        const documentValue = doc.metadata?.[key];

        // Skip if document doesn't have this metadata field
        if (documentValue === undefined) {
          return false;
        }

        // Handle array values (includes any match)
        if (Array.isArray(value)) {
          return value.some(v => documentValue === v);
        }

        // Handle string values (partial match)
        if (typeof documentValue === 'string' && typeof value === 'string') {
          return documentValue.toLowerCase().includes(value.toLowerCase());
        }

        // Handle exact match for other types
        return documentValue === value;
      });
  });
};

/**
 * Extract unique filter values from document metadata
 *
 * @param documents - Array of documents to extract values from
 * @param metadataField - Metadata field to extract values from
 * @returns Array of unique values
 */
export const extractFilterValues = (
  documents: Document[],
  metadataField: string
): any[] => {
  const values = new Set<any>();

  documents.forEach(doc => {
    const value = doc.metadata?.[metadataField];
    if (value !== undefined && value !== null) {
      values.add(value);
    }
  });

  return Array.from(values);
};

/**
 * Create filter options for a dropdown from documents
 *
 * @param documents - Array of documents to extract options from
 * @param metadataField - Metadata field to extract options from
 * @returns Array of options with value and label
 */
export const createFilterOptions = (
  documents: Document[],
  metadataField: string
): Array<{ value: string; label: string }> => {
  const values = extractFilterValues(documents, metadataField);

  return values.map(value => ({
    value: String(value),
    label: String(value),
  }));
};
