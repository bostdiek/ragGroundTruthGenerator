import { create } from 'zustand';

/**
 * UI state interface
 */
interface UIState {
  // Sidebar/Navigation
  isSidebarOpen: boolean;
  // Loading states
  isPageLoading: boolean;
  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setPageLoading: (isLoading: boolean) => void;
}

/**
 * UI store
 *
 * Provides global UI state using Zustand
 */
export const useUIStore = create<UIState>()(set => ({
  isSidebarOpen: false,
  isPageLoading: false,

  // Toggle sidebar visibility
  toggleSidebar: () => set(state => ({ isSidebarOpen: !state.isSidebarOpen })),

  // Set sidebar visibility
  setSidebarOpen: isOpen => set({ isSidebarOpen: isOpen }),

  // Set page loading state
  setPageLoading: isLoading => set({ isPageLoading: isLoading }),
}));
