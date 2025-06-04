/**
 * Collections Feature Exports
 *
 * This file exports all components of the collections feature.
 */

// Export API services
export { default as CollectionsService } from './api/collections.service';

// Export hooks
export * from './hooks/useCollections';

// Export components
export {
  CollectionCard,
  CollectionFilters,
  QAPairForm,
  QAPairList,
} from './components';

// Export types
export type {
  CollectionFilters as CollectionFilterOptions,
  QAPairFilters,
} from './types';
export { QAPairStatus } from './types';

// Export utils
export * from './utils';

// Export stores
export { useCollectionsStore } from './stores/collectionsStore';

// Export routes
export { default as collectionsRoutes } from './routes';
