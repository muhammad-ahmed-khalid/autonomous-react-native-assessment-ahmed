import { App } from '@/types/app';

export interface UseAppManagementContainerReturn {
  // Redux State
  apps: App[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  hasMore: boolean;
  loadingMore: boolean;
  currentPage: number;
  
  // Handlers
  handleRefresh: () => void;
  handleLoadMore: () => void;
  handleCreateApp: () => void;
  handleEditApp: (app: App) => void;
  handleDeleteApp: (app: App) => void;
  handleAppPress: (app: App) => void;
}
