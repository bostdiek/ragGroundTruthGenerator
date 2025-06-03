import { beforeEach, describe, expect, it } from 'vitest';
import { useUIStore } from '../../stores/ui-store';

describe('UI Store', () => {
  // Reset the store before each test
  beforeEach(() => {
    useUIStore.setState({
      isSidebarOpen: false,
      isPageLoading: false,
    });
  });

  it('should initialize with default values', () => {
    const state = useUIStore.getState();
    expect(state.isSidebarOpen).toBe(false);
    expect(state.isPageLoading).toBe(false);
  });

  it('should toggle sidebar state', () => {
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().isSidebarOpen).toBe(true);
    
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().isSidebarOpen).toBe(false);
  });

  it('should set sidebar state directly', () => {
    useUIStore.getState().setSidebarOpen(true);
    expect(useUIStore.getState().isSidebarOpen).toBe(true);
    
    useUIStore.getState().setSidebarOpen(false);
    expect(useUIStore.getState().isSidebarOpen).toBe(false);
  });

  it('should set page loading state', () => {
    useUIStore.getState().setPageLoading(true);
    expect(useUIStore.getState().isPageLoading).toBe(true);
    
    useUIStore.getState().setPageLoading(false);
    expect(useUIStore.getState().isPageLoading).toBe(false);
  });
});
