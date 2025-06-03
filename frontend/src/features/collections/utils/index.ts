/**
 * Collection Utilities
 * 
 * This file contains utility functions for working with collections.
 */

import { Collection, QAPair, QAPairStatus } from '../types';

/**
 * Get count of QA pairs by status
 * @param qaPairs - Array of QA pairs
 * @returns Object with counts by status
 */
export const getStatusCounts = (qaPairs: QAPair[]): Record<string, number> => {
  const counts: Record<string, number> = {
    ready_for_review: 0,
    approved: 0,
    revision_requested: 0,
    rejected: 0,
    draft: 0,
    total: qaPairs.length
  };
  
  qaPairs.forEach(qa => {
    if (qa.status in counts) {
      counts[qa.status]++;
    }
  });
  
  return counts;
};

/**
 * Format date string for display
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Filter collections based on search term
 * @param collections - Array of collections
 * @param searchTerm - Search term
 * @returns Filtered array of collections
 */
export const filterCollections = (collections: Collection[], searchTerm: string): Collection[] => {
  if (!searchTerm) return collections;
  
  const term = searchTerm.toLowerCase();
  return collections.filter(collection => 
    collection.name.toLowerCase().includes(term) || 
    collection.description.toLowerCase().includes(term)
  );
};

/**
 * Filter QA pairs based on search term and status
 * @param qaPairs - Array of QA pairs
 * @param filters - Filter criteria
 * @returns Filtered array of QA pairs
 */
export const filterQAPairs = (qaPairs: QAPair[], filters: { search?: string, status?: string[] }): QAPair[] => {
  let filtered = [...qaPairs];
  
  // Filter by search term
  if (filters.search) {
    const term = filters.search.toLowerCase();
    filtered = filtered.filter(qa => 
      qa.question.toLowerCase().includes(term) || 
      qa.answer.toLowerCase().includes(term)
    );
  }
  
  // Filter by status
  if (filters.status && filters.status.length > 0) {
    filtered = filtered.filter(qa => filters.status?.includes(qa.status));
  }
  
  return filtered;
};

/**
 * Sort collections based on field and order
 * @param collections - Array of collections
 * @param sortBy - Field to sort by
 * @param sortOrder - Sort direction (asc/desc)
 * @returns Sorted array of collections
 */
export const sortCollections = (
  collections: Collection[], 
  sortBy: keyof Collection = 'name',
  sortOrder: 'asc' | 'desc' = 'asc'
): Collection[] => {
  return [...collections].sort((a, b) => {
    let valueA = a[sortBy as keyof Collection];
    let valueB = b[sortBy as keyof Collection];
    
    // Handle string comparison
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return sortOrder === 'asc' 
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
    
    // Handle number comparison
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return sortOrder === 'asc' 
        ? valueA - valueB 
        : valueB - valueA;
    }
    
    // Handle date comparison
    if ((sortBy === 'created_at' || sortBy === 'updated_at') && valueA && valueB) {
      const dateA = new Date(valueA as string).getTime();
      const dateB = new Date(valueB as string).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    }
    
    return 0;
  });
};

/**
 * Sort QA pairs based on field and order
 * @param qaPairs - Array of QA pairs
 * @param sortBy - Field to sort by
 * @param sortOrder - Sort direction (asc/desc)
 * @returns Sorted array of QA pairs
 */
export const sortQAPairs = (
  qaPairs: QAPair[], 
  sortBy: keyof QAPair = 'question',
  sortOrder: 'asc' | 'desc' = 'asc'
): QAPair[] => {
  return [...qaPairs].sort((a, b) => {
    let valueA = a[sortBy as keyof QAPair];
    let valueB = b[sortBy as keyof QAPair];
    
    // Handle string comparison
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return sortOrder === 'asc' 
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
    
    // Handle date comparison
    if ((sortBy === 'created_at' || sortBy === 'updated_at') && valueA && valueB) {
      const dateA = new Date(valueA as string).getTime();
      const dateB = new Date(valueB as string).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    }
    
    return 0;
  });
};
