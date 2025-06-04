// Retrieval feature type definitions

export interface Document {
  id: string;
  title: string;
  content: string;
  source: string;
  metadata?: Record<string, any>;
}

export interface SearchParams {
  query: string;
  filters?: Record<string, any>;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  documents: Document[];
  totalCount: number;
}

export interface Source {
  id: string;
  name: string;
  description: string;
  type?: string;
}

export interface RetrievalFilters {
  sourceIds?: string[];
  dateRange?: {
    from?: string;
    to?: string;
  };
  documentTypes?: string[];
  [key: string]: any;
}

// Add more types as the retrieval feature is implemented
