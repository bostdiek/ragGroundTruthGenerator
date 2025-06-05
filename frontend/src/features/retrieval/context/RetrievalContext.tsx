import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { Document, Source } from '../../../types';
import {
  useDocumentSearch,
  useRecommendedDocuments,
  useSources,
} from '../hooks';
import { RetrievalStatus, useRetrievalStore } from '../stores';

/**
 * Extended context type to support the full retrieval workflow
 */
interface RetrievalContextType {
  // Workflow state
  status: RetrievalStatus;
  setStatus: (status: RetrievalStatus) => void;
  error: string | null;
  isReady: boolean; // Whether retrieval process is ready for consumption

  // Source-related
  sources: Source[];
  isLoadingSources: boolean;
  sourcesError: string | null;
  selectedSources: string[];
  selectSource: (sourceId: string, isSelected: boolean) => void;

  // Document-related
  documents: Document[];
  isLoadingDocuments: boolean;
  documentsError: string | null;
  selectedDocuments: Document[];
  selectDocument: (document: Document, isSelected: boolean) => void;

  // Search and filtering
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: Record<string, any>;
  setFilter: (key: string, value: any) => void;
  clearFilters: () => void;

  // Workflow actions
  startWorkflow: () => void;
  completeWorkflow: () => void;
  resetWorkflow: () => void;
  fetchRecommendedDocuments: (question: string) => Promise<Document[]>;
  searchDocuments: (query: string) => Promise<Document[]>;
  clearSelections: () => void;
}

// Create the context with a default value
const RetrievalContext = createContext<RetrievalContextType | undefined>(
  undefined
);

// Provider component
interface RetrievalProviderProps {
  children: ReactNode;
}

export const RetrievalProvider: React.FC<RetrievalProviderProps> = ({
  children,
}) => {
  // Use the retrieval store for state management
  const {
    // Workflow state
    status,
    setStatus,
    error,
    setError,
    isReady,

    // Selections
    selectedSources,
    selectSource,
    clearSelectedSources,
    selectedDocuments,
    selectDocument: selectDocumentInStore,
    clearSelectedDocuments,

    // Search state
    searchQuery,
    setSearchQuery,
    setLastSearchedQuery,

    // Results cache
    setSourceResults,
    setDocumentResults,

    // Filters
    filters,
    setFilter,
    clearFilters,

    // Workflow actions
    startWorkflow,
    completeWorkflow,
    resetWorkflow,
  } = useRetrievalStore();

  // Reset workflow state when the provider is mounted
  useEffect(() => {
    // Reset the workflow state to ensure we start fresh
    resetWorkflow();
    // Only run this effect once when the provider is mounted
  }, [resetWorkflow]);

  // Use custom hooks for data fetching
  const {
    data: sourcesData,
    isLoading: isLoadingSources,
    error: sourcesError,
  } = useSources(1, 50, {
    onSuccess: (data: any) => {
      setSourceResults(data);
    },
  });

  const sources = sourcesData?.data || [];

  // State for documents
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState('');

  // Document recommendation query (disabled by default, will be triggered by fetchRecommendedDocuments)
  const {
    refetch: refetchRecommendedDocuments,
    isLoading: isRecommendationLoading,
    error: recommendationError,
  } = useRecommendedDocuments(
    currentQuestion,
    {
      filters: {
        ...filters,
        sourceIds: selectedSources,
      },
    },
    { enabled: false }
  );

  // Document search query (disabled by default, will be triggered by searchDocuments)
  const {
    refetch: refetchDocumentSearch,
    isLoading: isSearchLoading,
    error: searchError,
  } = useDocumentSearch(
    {
      query: searchQuery,
      filters: {
        ...filters,
        sourceIds: selectedSources,
      },
    },
    { enabled: false }
  );

  // Fetch recommended documents based on the question and selected sources
  const fetchRecommendedDocuments = async (
    question: string
  ): Promise<Document[]> => {
    if (!question.trim() || selectedSources.length === 0) {
      setError('Please enter a question and select at least one source');
      return [];
    }

    setIsLoadingDocuments(true);
    setDocumentsError(null);
    setCurrentQuestion(question);
    setStatus('searching');

    try {
      const result = await refetchRecommendedDocuments();
      const fetchedDocuments = result.data?.documents || [];
      // Use type assertion to handle the type incompatibility
      setDocuments(fetchedDocuments as unknown as Document[]);
      setDocumentResults(result.data as any);

      // Always clear the error first
      setError(null);

      // Only set error if no documents found
      if (fetchedDocuments.length === 0) {
        setError(
          'No relevant documents found. Try a different question or select different sources.'
        );
        setStatus('error');
      } else {
        setStatus('selecting_documents');
      }

      return fetchedDocuments as unknown as Document[];
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to fetch relevant documents';
      setDocumentsError(errorMessage);
      setError(errorMessage);
      setStatus('error');
      return [];
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  // Search for documents with the given query
  const searchDocuments = async (query: string): Promise<Document[]> => {
    if (!query.trim() || selectedSources.length === 0) {
      setError('Please enter a search query and select at least one source');
      return [];
    }

    setIsLoadingDocuments(true);
    setDocumentsError(null);
    setSearchQuery(query);
    setLastSearchedQuery(query);
    setStatus('searching');

    try {
      const result = await refetchDocumentSearch();
      const fetchedDocuments = result.data?.documents || [];
      // Use type assertion to handle the type incompatibility
      setDocuments(fetchedDocuments as unknown as Document[]);
      setDocumentResults(result.data as any);

      if (fetchedDocuments.length === 0) {
        setError(
          'No documents found. Try a different search or select different sources.'
        );
      } else {
        setError(null);
        setStatus('selecting_documents');
      }

      return fetchedDocuments as unknown as Document[];
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to search for documents';
      setDocumentsError(errorMessage);
      setError(errorMessage);
      setStatus('error');
      return [];
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  // Handle document selection
  const selectDocument = useCallback(
    (document: Document, isSelected: boolean) => {
      selectDocumentInStore(document, isSelected);

      // If we have at least one document selected, we're ready to complete the workflow
      if (isSelected || selectedDocuments.length > 0) {
        setStatus('completed');
      } else if (selectedDocuments.length === 0) {
        setStatus('selecting_documents');
      }
    },
    [selectDocumentInStore, selectedDocuments.length, setStatus]
  );

  // Clear all selections and reset the workflow
  const clearSelections = useCallback(() => {
    clearSelectedSources();
    clearSelectedDocuments();
    clearFilters();
    setDocuments([]);
    resetWorkflow();
  }, [
    clearSelectedSources,
    clearSelectedDocuments,
    clearFilters,
    resetWorkflow,
  ]);

  // Update loading and error states based on query state
  useEffect(() => {
    setIsLoadingDocuments(isRecommendationLoading || isSearchLoading);

    if (recommendationError || searchError) {
      const errorMessage = 'Failed to fetch documents. Please try again.';
      setDocumentsError(errorMessage);
      setError(errorMessage);
    }
  }, [
    isRecommendationLoading,
    recommendationError,
    isSearchLoading,
    searchError,
    setError,
  ]);

  // Effect to update error state based on workflow status and document count
  useEffect(() => {
    // Clear error message when:
    // 1. We're in the source selection phase
    // 2. We have successfully found documents
    // 3. We're in the initial state
    // 4. We're still loading documents
    if (
      status === 'idle' ||
      status === 'selecting_sources' ||
      documents.length > 0 ||
      isLoadingDocuments
    ) {
      setError(null);
    }
  }, [status, documents, isLoadingDocuments, setError]);

  // Provide the complete context value
  const value = {
    // Workflow state
    status,
    setStatus,
    error,
    isReady,

    // Source-related
    sources,
    isLoadingSources,
    sourcesError: sourcesError
      ? 'Failed to load data sources. Please try again.'
      : null,
    selectedSources,
    selectSource,

    // Document-related
    documents,
    isLoadingDocuments,
    documentsError,
    selectedDocuments,
    selectDocument,

    // Search and filtering
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    clearFilters,

    // Workflow actions
    startWorkflow,
    completeWorkflow,
    resetWorkflow,
    fetchRecommendedDocuments,
    searchDocuments,
    clearSelections,
  };

  return (
    <RetrievalContext.Provider value={value}>
      {children}
    </RetrievalContext.Provider>
  );
};

// Hook to use the retrieval context
export const useRetrievalContext = () => {
  const context = useContext(RetrievalContext);
  if (!context) {
    throw new Error(
      'useRetrievalContext must be used within a RetrievalProvider'
    );
  }
  return context;
};
