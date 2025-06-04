import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import { Document, Source } from '../../../types';
import { useRecommendedDocuments, useSources } from '../hooks';
import { useRetrievalStore } from '../stores';

interface RetrievalContextType {
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

  // Actions
  fetchRecommendedDocuments: (question: string) => Promise<Document[]>;
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
    selectedSources,
    selectSource,
    clearSelectedSources,
    selectedDocuments,
    selectDocument: selectDocumentInStore,
    clearSelectedDocuments,
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    clearFilters,
  } = useRetrievalStore();

  // Use custom hooks for data fetching
  const {
    data: sources = [],
    isLoading: isLoadingSources,
    error: sourcesError,
  } = useSources();

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
  } = useRecommendedDocuments(currentQuestion, selectedSources, filters, false);

  // Fetch recommended documents based on the question and selected sources
  const fetchRecommendedDocuments = async (
    question: string
  ): Promise<Document[]> => {
    if (!question.trim() || selectedSources.length === 0) {
      return [];
    }

    setIsLoadingDocuments(true);
    setDocumentsError(null);
    setCurrentQuestion(question);

    try {
      const result = await refetchRecommendedDocuments();
      const documents = result.data || [];
      setDocuments(documents);
      return documents;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to fetch relevant documents';
      setDocumentsError(errorMessage);
      return [];
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  // Handle document selection
  const selectDocument = (document: Document, isSelected: boolean) => {
    selectDocumentInStore(document, isSelected);
  };

  // Clear all selections
  const clearSelections = () => {
    clearSelectedSources();
    clearSelectedDocuments();
    clearFilters();
    setDocuments([]);
  };

  // Update loading and error states based on query state
  useEffect(() => {
    setIsLoadingDocuments(isRecommendationLoading);
    if (recommendationError) {
      setDocumentsError('Failed to fetch documents. Please try again.');
    }
  }, [isRecommendationLoading, recommendationError]);

  const value = {
    sources,
    isLoadingSources,
    sourcesError: sourcesError
      ? 'Failed to load data sources. Please try again.'
      : null,
    selectedSources,
    selectSource,

    documents,
    isLoadingDocuments,
    documentsError,
    selectedDocuments,
    selectDocument,

    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    clearFilters,

    fetchRecommendedDocuments,
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
