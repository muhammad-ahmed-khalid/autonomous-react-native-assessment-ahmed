export interface UseSettingsContainerReturn {
  // Redux State
  user: any;
  isLoading: boolean;
  
  // Handlers
  handleLogout: () => void;
}
