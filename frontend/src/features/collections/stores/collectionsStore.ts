/**
 * Collections Store
 * 
 * This file contains a Zustand store for managing UI state related to collections.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CollectionFilters, QAPairFilters } from '../types';

interface CollectionsState {
  // Filters
  collectionFilters: CollectionFilters;
  qaPairFilters: QAPairFilters;
  
  // UI State
  selectedCollectionId: string | null;
  selectedQAPairId: string | null;
  
  // Sort state
  collectionSortBy: CollectionFilters['sortBy'];
  collectionSortOrder: CollectionFilters['sortOrder'];
  qaPairSortBy: QAPairFilters['sortBy'];
  qaPairSortOrder: QAPairFilters['sortOrder'];
  
  // Actions
  setCollectionFilters: (filters: Partial<CollectionFilters>) => void;
  setQAPairFilters: (filters: Partial<QAPairFilters>) => void;
  setSelectedCollectionId: (id: string | null) => void;
  setSelectedQAPairId: (id: string | null) => void;
  setCollectionSort: (sortBy: CollectionFilters['sortBy'], sortOrder: CollectionFilters['sortOrder']) => void;
  setQAPairSort: (sortBy: QAPairFilters['sortBy'], sortOrder: QAPairFilters['sortOrder']) => void;
  resetFilters: () => void;
}

/**
 * Zustand store for collections UI state
 */
export const useCollectionsStore = create<CollectionsState>()(
  persist(
    (set) => ({
      // Default state
      collectionFilters: { search: '', tags: [] },
      qaPairFilters: { search: '', status: [] },
      selectedCollectionId: null,
      selectedQAPairId: null,
      collectionSortBy: 'name',
      collectionSortOrder: 'asc',
      qaPairSortBy: 'question',
      qaPairSortOrder: 'asc',
      
      // Actions
      setCollectionFilters: (filters) => 
        set((state) => ({ 
          collectionFilters: { ...state.collectionFilters, ...filters } 
        })),
        
      setQAPairFilters: (filters) => 
        set((state) => ({ 
          qaPairFilters: { ...state.qaPairFilters, ...filters } 
        })),
        
      setSelectedCollectionId: (id) => 
        set({ selectedCollectionId: id }),
        
      setSelectedQAPairId: (id) => 
        set({ selectedQAPairId: id }),
        
      setCollectionSort: (sortBy, sortOrder) => 
        set({ collectionSortBy: sortBy, collectionSortOrder: sortOrder }),
        
      setQAPairSort: (sortBy, sortOrder) => 
        set({ qaPairSortBy: sortBy, qaPairSortOrder: sortOrder }),
        
      resetFilters: () => 
        set({ 
          collectionFilters: { search: '', tags: [] },
          qaPairFilters: { search: '', status: [] }
        }),
    }),
    {
      name: 'collections-store',
      // Only persist certain parts of the store
      partialize: (state) => ({
        collectionSortBy: state.collectionSortBy,
        collectionSortOrder: state.collectionSortOrder,
        qaPairSortBy: state.qaPairSortBy,
        qaPairSortOrder: state.qaPairSortOrder,
      }),
    }
  )
);
