import { create, StateCreator, StoreApi, UseBoundStore } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';

/**
 * Create a Zustand store with persistence
 *
 * @param name Name of the store in local storage
 * @param config Configuration options for the store
 * @param options Persistence options
 * @returns A Zustand store with persistence
 */
export const createPersistentStore = <T>(
  name: string,
  config: StateCreator<T>,
  options: Partial<PersistOptions<T>> = {}
): UseBoundStore<StoreApi<T>> => {
  return create<T>()(
    persist(config, {
      name,
      ...options,
    })
  );
};

/**
 * Types and options for store persistence
 */
export const StorageTypes = {
  LOCAL_STORAGE: 'localStorage',
  SESSION_STORAGE: 'sessionStorage',
} as const;

export type StorageType = (typeof StorageTypes)[keyof typeof StorageTypes];

/**
 * Default persistence options
 */
export const defaultPersistOptions = {
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
};
