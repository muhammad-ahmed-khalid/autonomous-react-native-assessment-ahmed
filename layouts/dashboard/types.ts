import { App } from '@/types/app';

export interface UseDashboardContainerReturn {
  // Redux State
  user: any;
  apps: App[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  hasMore: boolean;
  loadingMore: boolean;
  currentPage: number;
  searching: boolean;
  
  // Search State
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  debouncedSearch: string;
  
  // Handlers
  handleRefresh: () => void;
  handleLoadMore: () => void;
  handleAppPress: (app: App) => void;
  handleCreateApp: () => void;
  handleEditApp: (app: App) => void;
  handleDeleteApp: (app: App) => void;
  handleLogout: () => void;
}
