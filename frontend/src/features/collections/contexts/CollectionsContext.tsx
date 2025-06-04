import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import CollectionsService, {
  Collection,
  QAPair,
} from '../../collections/api/collections.service';

// Types
interface CollectionsContextType {
  collections: Collection[];
  currentCollection: Collection | null;
  qaPairs: QAPair[];
  isLoading: boolean;
  error: string | null;
  fetchCollections: () => Promise<void>;
  fetchCollection: (id: string) => Promise<void>;
  fetchQAPairs: (collectionId: string) => Promise<void>;
  createCollection: (name: string, description: string) => Promise<Collection>;
  updateCollection: (
    id: string,
    name: string,
    description: string
  ) => Promise<Collection>;
  deleteCollection: (id: string) => Promise<void>;
  clearCurrentCollection: () => void;
  createQAPair: (
    collectionId: string,
    qaPairData: Partial<QAPair>
  ) => Promise<QAPair>;
}

// Create context with default values
const CollectionsContext = createContext<CollectionsContextType>({
  collections: [],
  currentCollection: null,
  qaPairs: [],
  isLoading: false,
  error: null,
  fetchCollections: async () => {},
  fetchCollection: async () => {},
  fetchQAPairs: async () => {},
  createCollection: async () => ({
    id: '',
    name: '',
    description: '',
    tags: [],
    created_at: '',
    updated_at: '',
    document_count: 0,
  }),
  updateCollection: async () => ({
    id: '',
    name: '',
    description: '',
    tags: [],
    created_at: '',
    updated_at: '',
    document_count: 0,
  }),
  deleteCollection: async () => {},
  clearCurrentCollection: () => {},
  createQAPair: async () => ({
    id: '',
    collection_id: '',
    question: '',
    answer: '',
    documents: [],
    created_at: '',
    updated_at: '',
    created_by: '',
    status: 'ready_for_review',
    metadata: {},
  }),
});

// Hook to use the collections context
export const useCollections = () => useContext(CollectionsContext);

// Provider component
export const CollectionsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [currentCollection, setCurrentCollection] = useState<Collection | null>(
    null
  );
  const [qaPairs, setQAPairs] = useState<QAPair[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all collections
  const fetchCollections = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await CollectionsService.getCollections();
      setCollections(data);
    } catch (err) {
      console.error('Failed to fetch collections:', err);
      setError('Failed to load collections. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch a specific collection
  const fetchCollection = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await CollectionsService.getCollection(id);
      setCurrentCollection(data);
    } catch (err) {
      console.error(`Failed to fetch collection ${id}:`, err);
      setError('Failed to load collection details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Q&A pairs for a collection
  const fetchQAPairs = async (collectionId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await CollectionsService.getQAPairs(collectionId);
      setQAPairs(data);
    } catch (err) {
      console.error(
        `Failed to fetch Q&A pairs for collection ${collectionId}:`,
        err
      );
      setError('Failed to load Q&A pairs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new collection
  const createCollection = async (name: string, description: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const newCollection = await CollectionsService.createCollection({
        name,
        description,
      });
      setCollections(prev => [...prev, newCollection]);
      return newCollection;
    } catch (err) {
      console.error('Failed to create collection:', err);
      setError('Failed to create collection. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing collection
  const updateCollection = async (
    id: string,
    name: string,
    description: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedCollection = await CollectionsService.updateCollection(id, {
        name,
        description,
      });

      // Update collections list
      setCollections(prev =>
        prev.map(collection =>
          collection.id === id ? updatedCollection : collection
        )
      );

      // Update current collection if it's the one being edited
      if (currentCollection?.id === id) {
        setCurrentCollection(updatedCollection);
      }

      return updatedCollection;
    } catch (err) {
      console.error(`Failed to update collection ${id}:`, err);
      setError('Failed to update collection. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a collection
  const deleteCollection = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await CollectionsService.deleteCollection(id);

      // Remove from collections list
      setCollections(prev => prev.filter(collection => collection.id !== id));

      // Clear current collection if it's the one being deleted
      if (currentCollection?.id === id) {
        setCurrentCollection(null);
      }
    } catch (err) {
      console.error(`Failed to delete collection ${id}:`, err);
      setError('Failed to delete collection. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Clear current collection
  const clearCurrentCollection = () => {
    setCurrentCollection(null);
    setQAPairs([]);
  };

  // Create a new QA pair
  const createQAPair = async (
    collectionId: string,
    qaPairData: Partial<QAPair>
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const newQAPair = await CollectionsService.createQAPair(
        collectionId,
        qaPairData
      );

      // Add to QA pairs list if we're currently viewing this collection
      if (currentCollection?.id === collectionId) {
        setQAPairs(prev => [...prev, newQAPair]);
      }

      // Update the collection's QA count if it's in our list
      setCollections(prev =>
        prev.map(collection =>
          collection.id === collectionId
            ? {
                ...collection,
                document_count: (collection.document_count || 0) + 1,
              }
            : collection
        )
      );

      // Update current collection if it's the one we're adding to
      if (currentCollection?.id === collectionId) {
        setCurrentCollection(prev =>
          prev
            ? { ...prev, document_count: (prev.document_count || 0) + 1 }
            : null
        );
      }

      return newQAPair;
    } catch (err) {
      console.error(
        `Failed to create QA pair for collection ${collectionId}:`,
        err
      );
      setError('Failed to create QA pair. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Load collections on mount
  useEffect(() => {
    fetchCollections();
  }, []);

  // Context value
  const value = {
    collections,
    currentCollection,
    qaPairs,
    isLoading,
    error,
    fetchCollections,
    fetchCollection,
    fetchQAPairs,
    createCollection,
    updateCollection,
    deleteCollection,
    clearCurrentCollection,
    createQAPair,
  };

  return (
    <CollectionsContext.Provider value={value}>
      {children}
    </CollectionsContext.Provider>
  );
};

export default CollectionsContext;
