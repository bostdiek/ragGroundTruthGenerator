/**
 * Test data factories
 * 
 * These factories help generate test data consistently
 * and allow tests to focus only on the relevant parts of the data.
 */

import { v4 as uuidv4 } from 'uuid';

// User type definition
export interface User {
  id: string;
  username: string;
  email: string;
  full_name?: string;
}

// Collection type definition
export interface Collection {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  owner_id: string;
  qa_count: number;
}

// QA Pair type definition
export interface QAPair {
  id: string;
  collection_id: string;
  question: string;
  answer: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

/**
 * User factory
 */
export const createUser = (overrides: Partial<User> = {}): User => {
  const defaultUsername = `user_${Math.floor(Math.random() * 10000)}`;
  
  return {
    id: uuidv4(),
    username: defaultUsername,
    email: `${defaultUsername}@example.com`,
    full_name: `Test User ${defaultUsername}`,
    ...overrides
  };
};

/**
 * Collection factory
 */
export const createCollection = (overrides: Partial<Collection> = {}): Collection => {
  const id = overrides.id || uuidv4();
  const now = new Date().toISOString();
  
  return {
    id,
    name: `Test Collection ${id.substring(0, 4)}`,
    description: 'This is a test collection',
    created_at: now,
    updated_at: now,
    owner_id: uuidv4(),
    qa_count: 0,
    ...overrides
  };
};

/**
 * QA Pair factory
 */
export const createQAPair = (overrides: Partial<QAPair> = {}): QAPair => {
  const id = overrides.id || uuidv4();
  const now = new Date().toISOString();
  
  return {
    id,
    collection_id: overrides.collection_id || uuidv4(),
    question: `Test question ${id.substring(0, 4)}?`,
    answer: `Test answer for ${id.substring(0, 4)}.`,
    created_at: now,
    updated_at: now,
    metadata: {},
    ...overrides
  };
};

/**
 * Create multiple collections
 */
export const createCollections = (count: number, overrides: Partial<Collection> = {}): Collection[] => {
  return Array.from({ length: count }).map(() => createCollection(overrides));
};

/**
 * Create multiple QA pairs
 */
export const createQAPairs = (count: number, overrides: Partial<QAPair> = {}): QAPair[] => {
  return Array.from({ length: count }).map(() => createQAPair(overrides));
};
