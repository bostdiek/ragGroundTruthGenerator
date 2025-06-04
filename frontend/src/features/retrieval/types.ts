// Retrieval feature type definitions
// These will be populated when implementing the retrieval feature

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

// Add more types as the retrieval feature is implemented
