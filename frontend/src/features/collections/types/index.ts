/**
 * Collection Types
 *
 * This file contains TypeScript types for collections-related data.
 */

// Import base types from the core types
import {
  Collection as CoreCollection,
  Document,
  QAPair as CoreQAPair,
} from '../../../types';

// Re-export the core types
export type { CoreCollection as Collection, Document, CoreQAPair as QAPair };

/**
 * QA Pair status enum mapping to core status values
 */
export enum QAPairStatus {
  DRAFT = 'draft',
  REVIEW = 'ready_for_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REVISION = 'revision_requested',
}

/**
 * Collection creation request
 */
export interface CollectionCreateRequest {
  name: string;
  description: string;
  tags?: string[];
}

/**
 * QA Pair creation request
 */
export interface QAPairCreateRequest {
  question: string;
  answer: string;
  metadata?: Record<string, any>;
}

/**
 * Collection filters
 */
export interface CollectionFilters {
  search?: string;
  tags?: string[];
  sortBy?: 'name' | 'created_at' | 'updated_at' | 'document_count';
  sortOrder?: 'asc' | 'desc';
}

/**
 * QA Pair filters
 */
export interface QAPairFilters {
  search?: string;
  status?: string[];
  sortBy?: 'question' | 'created_at' | 'updated_at' | 'status';
  sortOrder?: 'asc' | 'desc';
}
