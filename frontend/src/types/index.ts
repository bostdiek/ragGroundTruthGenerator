/**
 * AI Ground Truth Generator - Core Types
 * 
 * This file contains all the core data types used throughout the application.
 * When extending or customizing this template, modify these interfaces to match your data structure.
 */

/**
 * Collection represents a group of QA pairs for a specific purpose or dataset.
 * 
 * Customization options:
 * - Add domain-specific metadata fields
 * - Add additional categorization properties
 * - Add permissions or sharing options
 */
export interface Collection {
  id: string;
  name: string;
  description: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  document_count: number;
  status_counts?: {[key: string]: number};
  
  // Extensible metadata - Add custom fields here
  metadata?: Record<string, any>;
  
  // Optional fields for advanced use cases
  // tags?: string[];
  // category?: string;
  // visibility?: 'private' | 'team' | 'public';
}

/**
 * QAPair represents a question-answer pair with associated source documents.
 * 
 * Customization options:
 * - Add confidence scores
 * - Add specialized metadata for different domains
 * - Add alternative answers or answer variations
 * - Add review comments or feedback
 */
export interface QAPair {
  id: string;
  collection_id: string;
  question: string;
  answer: string;
  documents: Document[];
  created_at: string;
  updated_at: string;
  created_by: string;
  status: 'ready_for_review' | 'approved' | 'revision_requested' | 'rejected';
  
  // Extensible metadata - Add custom fields here
  metadata: Record<string, any>;
  
  // Optional fields for advanced use cases
  // confidence_score?: number;
  // review_comments?: string;
  // alternative_answers?: string[];
  // tags?: string[];
}

/**
 * Document represents a source document used for retrieval and answer generation.
 * 
 * Customization options:
 * - Add document type classifiers
 * - Add confidence or relevance scores
 * - Add source-specific metadata
 */
export interface Document {
  id: string;
  title: string;
  content: string;
  url?: string;
  source: {
    id: string;
    name: string;
    type?: string;
  };
  
  // Extensible metadata - Add custom fields here
  metadata?: Record<string, any>;
  
  // Optional fields for advanced use cases
  relevance_score?: number;
  query_terms?: string[]; // Terms used for matching/highlighting
  // document_type?: string;
  // last_modified?: string;
  // file_type?: string;
}

/**
 * Source represents the origin of a document.
 * 
 * Customization options:
 * - Add source-specific authentication or configuration
 * - Add categorization or classification
 */
export interface Source {
  id: string;
  name: string;
  description: string;
  
  // Extensible metadata - Add custom fields here
  metadata?: Record<string, any>;
}

/**
 * SearchQuery represents a search request for document retrieval.
 * 
 * Customization options:
 * - Add filters for specific document types
 * - Add advanced search parameters
 */
export interface SearchQuery {
  query: string;
  filters?: Record<string, any>;
  sources?: string[];
  limit?: number;
}

/**
 * GenerationRequest represents a request to generate an answer from documents.
 * 
 * Customization options:
 * - Add model selection parameters
 * - Add generation preferences or constraints
 */
export interface GenerationRequest {
  question: string;
  documents: Document[];
  max_tokens?: number;
  rules?: Rule[];
  
  // Extensible parameters - Add custom fields here
  parameters?: Record<string, any>;
}

/**
 * GenerationResponse represents the response from the answer generation service.
 * 
 * Customization options:
 * - Add confidence scores
 * - Add alternative answers
 * - Add explanation or reasoning
 */
export interface GenerationResponse {
  answer: string;
  
  // Extensible metadata - Add custom fields here
  metadata?: Record<string, any>;
  
  // Optional fields for advanced use cases
  // confidence_score?: number;
  // alternative_answers?: string[];
  // explanation?: string;
  // citations?: Citation[];
}

/**
 * Rule represents a constraint or guideline for answer generation.
 * 
 * Customization options:
 * - Add rule types or categories
 * - Add priority levels
 */
export interface Rule {
  id: string;
  description: string;
  type: string;
  
  // Extensible parameters - Add custom fields here
  parameters?: Record<string, any>;
}

/**
 * User represents a user of the application.
 * 
 * Customization options:
 * - Add roles and permissions
 * - Add user preferences
 */
export interface User {
  id: string;
  email: string;
  name: string;
  
  // Extensible properties - Add custom fields here
  properties?: Record<string, any>;
  
  // Optional fields for advanced use cases
  // role?: string;
  // permissions?: string[];
  // preferences?: Record<string, any>;
}

/**
 * Authentication-related types
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
}
