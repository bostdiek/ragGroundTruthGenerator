// Retrieval feature type definitions

export interface Source {
  id: string;
  name: string;
  type: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  url?: string;
  source: Source;
  metadata?: Record<string, any>;
  relevance_score?: number;
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
