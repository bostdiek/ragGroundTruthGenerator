import { create } from 'zustand';

import { Document } from '../../../types';

interface RetrievalState {
  // Source selection
  selectedSources: string[];
  selectSource: (sourceId: string, isSelected: boolean) => void;
  clearSelectedSources: () => void;

  // Document selection
  selectedDocuments: Document[];
  selectDocument: (document: Document, isSelected: boolean) => void;
  clearSelectedDocuments: () => void;

  // Search state
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Filter state
  filters: Record<string, any>;
  setFilter: (key: string, value: any) => void;
  clearFilters: () => void;
}

/**
 * Store for managing retrieval state
 */
const useRetrievalStore = create<RetrievalState>(set => ({
  // Source selection
  selectedSources: [],
  selectSource: (sourceId, isSelected) =>
    set(state => ({
      selectedSources: isSelected
        ? [...state.selectedSources, sourceId]
        : state.selectedSources.filter(id => id !== sourceId),
    })),
  clearSelectedSources: () => set({ selectedSources: [] }),

  // Document selection
  selectedDocuments: [],
  selectDocument: (document, isSelected) =>
    set(state => ({
      selectedDocuments: isSelected
        ? [...state.selectedDocuments, document]
        : state.selectedDocuments.filter(doc => doc.id !== document.id),
    })),
  clearSelectedDocuments: () => set({ selectedDocuments: [] }),

  // Search state
  searchQuery: '',
  setSearchQuery: query => set({ searchQuery: query }),

  // Filter state
  filters: {},
  setFilter: (key, value) =>
    set(state => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    })),
  clearFilters: () => set({ filters: {} }),
}));

export default useRetrievalStore;
