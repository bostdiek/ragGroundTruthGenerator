import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { Document, Source } from '../../../types';

// Define interfaces for pagination and search results
interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

interface SearchResult {
  documents: Document[];
  totalCount: number;
  page: number;
  totalPages: number;
}

// Define tab-specific filter state
interface TabFilterState {
  searchText: string;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  metadataFilters: Record<string, string>;
}

// Define workflow states for retrieval process
export type RetrievalStatus =
  | 'idle' // Initial state
  | 'selecting_sources' // Selecting data sources
  | 'searching' // Searching for documents
  | 'selecting_documents' // Selecting documents from search results
  | 'completed' // Retrieval workflow completed
  | 'error'; // Error state

interface RetrievalState {
  // Workflow state
  status: RetrievalStatus;
  setStatus: (status: RetrievalStatus) => void;
  error: string | null;
  setError: (error: string | null) => void;
  isReady: boolean; // Whether retrieval process is complete and ready for consumption

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
  lastSearchedQuery: string;
  setLastSearchedQuery: (query: string) => void;

  // Tab-specific filter state
  tabFilters: Record<string, TabFilterState>;
  setTabFilter: (tabId: string, filterState: Partial<TabFilterState>) => void;
  getTabFilter: (tabId: string) => TabFilterState;
  clearTabFilter: (tabId: string) => void;
  clearAllTabFilters: () => void;

  // Result cache
  sourceResults: PaginatedResponse<Source> | null;
  setSourceResults: (results: PaginatedResponse<Source> | null) => void;
  documentResults: SearchResult | null;
  setDocumentResults: (results: SearchResult | null) => void;

  // Filter state
  filters: Record<string, any>;
  setFilter: (key: string, value: any) => void;
  clearFilters: () => void;

  // Workflow actions
  startWorkflow: () => void;
  completeWorkflow: () => void;
  resetWorkflow: () => void;
}

// Default tab filter state
const defaultTabFilterState: TabFilterState = {
  searchText: '',
  sortBy: 'relevance',
  sortDirection: 'desc',
  metadataFilters: {},
};

/**
 * Store for managing retrieval state
 */
const useRetrievalStore = create<RetrievalState>()(
  devtools(
    persist(
      (set, get) => ({
        // Workflow state
        status: 'idle',
        setStatus: status => set({ status }),
        error: null,
        setError: error => set({ error }),
        isReady: false,

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
            // If we've selected at least one document, we're ready
            isReady: isSelected || state.selectedDocuments.length > 1,
          })),
        clearSelectedDocuments: () =>
          set({
            selectedDocuments: [],
            isReady: false,
          }),

        // Search state
        searchQuery: '',
        setSearchQuery: query => set({ searchQuery: query }),
        lastSearchedQuery: '',
        setLastSearchedQuery: query => set({ lastSearchedQuery: query }),

        // Tab-specific filter state
        tabFilters: {},
        setTabFilter: (tabId, filterState) =>
          set(state => ({
            tabFilters: {
              ...state.tabFilters,
              [tabId]: {
                ...defaultTabFilterState,
                ...state.tabFilters[tabId],
                ...filterState,
              },
            },
          })),
        getTabFilter: (tabId: string) => {
          const state = get();
          return state.tabFilters[tabId] || defaultTabFilterState;
        },
        clearTabFilter: tabId =>
          set(state => {
            const newTabFilters = { ...state.tabFilters };
            delete newTabFilters[tabId];
            return { tabFilters: newTabFilters };
          }),
        clearAllTabFilters: () => set({ tabFilters: {} }),

        // Result cache
        sourceResults: null,
        setSourceResults: results => set({ sourceResults: results }),
        documentResults: null,
        setDocumentResults: results => set({ documentResults: results }),

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

        // Workflow actions
        startWorkflow: () =>
          set({
            status: 'selecting_sources',
            isReady: false,
            error: null,
          }),

        completeWorkflow: () =>
          set({
            status: 'completed',
            isReady: true,
          }),

        resetWorkflow: () =>
          set({
            status: 'idle',
            isReady: false,
            selectedSources: [],
            selectedDocuments: [],
            searchQuery: '',
            lastSearchedQuery: '',
            documentResults: null,
            filters: {},
            error: null,
            tabFilters: {},
          }),
      }),
      {
        name: 'retrieval-store',
        // Only persist selection state, not the full workflow state or cached results
        partialize: state => ({
          selectedSources: state.selectedSources,
          selectedDocuments: state.selectedDocuments,
          filters: state.filters,
          tabFilters: state.tabFilters,
        }),
      }
    )
  )
);

export default useRetrievalStore;
