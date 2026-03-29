export interface App {
  id: string;
  name: string;
  logo: string;
  subscriptionStatus: 'active' | 'inactive' | 'trial' | 'expired';
  lastUpdated: string; // ISO date string
  description?: string;
}

export interface AppsState {
  apps: App[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  currentPage: number;
  hasMore: boolean;
  loadingMore: boolean;
  searchQuery: string;
  searching: boolean;
}
