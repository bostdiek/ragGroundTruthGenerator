import { Document } from '../../../types';

/**
 * Document filtering and sorting utilities
 * These utilities provide reusable functions for filtering, sorting, and searching documents
 */

export interface SearchOptions {
  query: string;
  fields?: string[]; // Fields to search in, defaults to all text fields
  caseSensitive?: boolean;
  exactMatch?: boolean;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
  customSortFn?: (a: Document, b: Document) => number;
}

export interface FilterOptions {
  metadata?: Record<string, string | string[]>;
  dateRange?: {
    start?: string;
    end?: string;
    field?: string; // Default: 'created_date'
  };
  relevanceThreshold?: number;
}

/**
 * Search documents by text across multiple fields
 */
export const searchDocuments = (
  documents: Document[],
  options: SearchOptions
): Document[] => {
  if (!options.query.trim()) {
    return documents;
  }

  const query = options.caseSensitive
    ? options.query
    : options.query.toLowerCase();
  const searchTerms = options.exactMatch
    ? [query]
    : query.split(' ').filter(term => term.length > 0);

  return documents.filter(doc => {
    // Define searchable fields
    const searchFields = options.fields || [
      'title',
      'content',
      'url',
      'source.name',
      'source.type',
    ];

    // Build searchable content
    const searchableContent: string[] = [];

    searchFields.forEach(field => {
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

    const combinedContent = options.caseSensitive
      ? searchableContent.join(' ')
      : searchableContent.join(' ').toLowerCase();

    if (options.exactMatch) {
      return combinedContent.includes(query);
    }

    return searchTerms.every(term => combinedContent.includes(term));
  });
};

/**
 * Filter documents based on metadata and other criteria
 */
export const filterDocuments = (
  documents: Document[],
  options: FilterOptions
): Document[] => {
  let filtered = [...documents];

  // Apply metadata filters
  if (options.metadata) {
    Object.entries(options.metadata).forEach(([key, value]) => {
      if (value && (Array.isArray(value) ? value.length > 0 : value.trim())) {
        filtered = filtered.filter(doc => {
          const docValue = doc.metadata?.[key];
          if (!docValue) return false;

          if (Array.isArray(value)) {
            return value.includes(docValue);
          }
          return docValue === value;
        });
      }
    });
  }

  // Apply date range filter
  if (options.dateRange) {
    const dateField = options.dateRange.field || 'created_date';
    filtered = filtered.filter(doc => {
      const docDate = doc.metadata?.[dateField];
      if (!docDate || typeof docDate !== 'string') return true;

      const date = new Date(docDate);
      if (isNaN(date.getTime())) return true;

      if (options.dateRange!.start) {
        const startDate = new Date(options.dateRange!.start);
        if (date < startDate) return false;
      }

      if (options.dateRange!.end) {
        const endDate = new Date(options.dateRange!.end);
        if (date > endDate) return false;
      }

      return true;
    });
  }

  // Apply relevance threshold filter
  if (options.relevanceThreshold !== undefined) {
    filtered = filtered.filter(
      doc => (doc.relevance_score || 0) >= options.relevanceThreshold!
    );
  }

  return filtered;
};

/**
 * Sort documents based on specified criteria
 */
export const sortDocuments = (
  documents: Document[],
  options: SortOptions
): Document[] => {
  const sorted = [...documents];

  if (options.customSortFn) {
    sorted.sort(options.customSortFn);
  } else {
    sorted.sort((a, b) => {
      let valueA: any;
      let valueB: any;

      // Handle special sorting fields
      switch (options.field) {
        case 'relevance':
          valueA = a.relevance_score || 0;
          valueB = b.relevance_score || 0;
          break;
        case 'title':
          valueA = a.title;
          valueB = b.title;
          break;
        case 'source':
          valueA = a.source?.name || '';
          valueB = b.source?.name || '';
          break;
        default:
          // Try to get value from metadata
          valueA = a.metadata?.[options.field] || '';
          valueB = b.metadata?.[options.field] || '';
      }

      // Handle different data types
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return valueA - valueB;
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        // Special handling for dates
        if (options.field.includes('date')) {
          const dateA = new Date(valueA);
          const dateB = new Date(valueB);
          if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
            return dateA.getTime() - dateB.getTime();
          }
        }
        return valueA.localeCompare(valueB);
      }

      return String(valueA).localeCompare(String(valueB));
    });
  }

  return options.direction === 'desc' ? sorted.reverse() : sorted;
};

/**
 * Get unique values for a specific metadata field across all documents
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

/**
 * Create filter options for a metadata field
 */
export const createFilterOptions = (
  documents: Document[],
  field: string,
  includeAll = true
): Array<{ value: string; label: string }> => {
  const values = getUniqueMetadataValues(documents, field);
  const options = values.map(value => ({ value, label: value }));

  if (includeAll) {
    options.unshift({ value: '', label: `All ${field}s` });
  }

  return options;
};

/**
 * Combine search, filter, and sort operations
 */
export const processDocuments = (
  documents: Document[],
  searchOptions?: SearchOptions,
  filterOptions?: FilterOptions,
  sortOptions?: SortOptions
): Document[] => {
  let result = documents;

  // Apply search first
  if (searchOptions) {
    result = searchDocuments(result, searchOptions);
  }

  // Apply filters
  if (filterOptions) {
    result = filterDocuments(result, filterOptions);
  }

  // Apply sorting last
  if (sortOptions) {
    result = sortDocuments(result, sortOptions);
  }

  return result;
};

/**
 * Get document statistics for display
 */
export const getDocumentStats = (
  documents: Document[]
): Record<string, any> => {
  const stats: Record<string, any> = {
    totalCount: documents.length,
    avgRelevanceScore: 0,
    metadataFields: getAvailableMetadataFields(documents),
  };

  // Calculate average relevance score
  const docsWithRelevance = documents.filter(
    doc => doc.relevance_score !== undefined
  );
  if (docsWithRelevance.length > 0) {
    stats.avgRelevanceScore =
      docsWithRelevance.reduce(
        (sum, doc) => sum + (doc.relevance_score || 0),
        0
      ) / docsWithRelevance.length;
  }

  // Count documents by metadata values
  stats.metadataFields.forEach((field: string) => {
    const fieldName = `${field}Counts`;
    stats[fieldName] = {};

    documents.forEach(doc => {
      const value = doc.metadata?.[field];
      if (typeof value === 'string' && value.trim()) {
        stats[fieldName][value] = (stats[fieldName][value] || 0) + 1;
      }
    });
  });

  return stats;
};
