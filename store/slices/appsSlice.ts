import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { App, AppsState } from '@/types/app';
import { appService } from '@/services/api';

const initialState: AppsState = {
  apps: [],
  loading: false,
  error: null,
  refreshing: false,
  currentPage: 0,
  hasMore: true,
  loadingMore: false,
  searchQuery: '',
  searching: false,
};

// Async thunks
export const fetchApps = createAsyncThunk(
  'apps/fetchApps',
  async (_, { rejectWithValue }) => {
    try {
      const apps = await appService.getApps(1, 10);
      return apps;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch apps');
    }
  }
);

export const loadMoreApps = createAsyncThunk(
  'apps/loadMore',
  async (page: number, { rejectWithValue }) => {
    try {
      const apps = await appService.getApps(page, 10);
      return apps;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load more apps');
    }
  }
);

export const refreshApps = createAsyncThunk(
  'apps/refreshApps',
  async (_, { rejectWithValue }) => {
    try {
      const apps = await appService.getApps(1, 10);
      return apps;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to refresh apps');
    }
  }
);

export const createApp = createAsyncThunk(
  'apps/create',
  async (appData: Partial<App>, { rejectWithValue }) => {
    try {
      const app = await appService.createApp(appData);
      return app;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create app');
    }
  }
);

export const updateApp = createAsyncThunk(
  'apps/update',
  async ({ id, data }: { id: string; data: Partial<App> }, { rejectWithValue }) => {
    try {
      const app = await appService.updateApp(id, data);
      return app;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update app');
    }
  }
);

export const deleteApp = createAsyncThunk(
  'apps/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await appService.deleteApp(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete app');
    }
  }
);

export const searchApps = createAsyncThunk(
  'apps/search',
  async (query: string, { rejectWithValue }) => {
    try {
      if (!query.trim()) {
        const apps = await appService.getApps(1, 10);
        return { apps, query: '' };
      }
      const apps = await appService.searchApps(query);
      return { apps, query };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to search apps');
    }
  }
);

const appsSlice = createSlice({
  name: 'apps',
  initialState,
  reducers: {
    clearAppsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch apps
    builder
      .addCase(fetchApps.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApps.fulfilled, (state, action) => {
        state.loading = false;
        state.apps = action.payload;
        state.currentPage = 1;
        state.hasMore = action.payload.length === 10;
      })
      .addCase(fetchApps.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Load more apps
    builder
      .addCase(loadMoreApps.pending, (state) => {
        state.loadingMore = true;
        state.error = null;
      })
      .addCase(loadMoreApps.fulfilled, (state, action) => {
        state.loadingMore = false;
        state.apps = [...state.apps, ...action.payload];
        state.currentPage += 1;
        state.hasMore = action.payload.length === 10;
      })
      .addCase(loadMoreApps.rejected, (state, action) => {
        state.loadingMore = false;
        state.error = action.payload as string;
      });

    // Refresh apps
    builder
      .addCase(refreshApps.pending, (state) => {
        state.refreshing = true;
        state.error = null;
      })
      .addCase(refreshApps.fulfilled, (state, action) => {
        state.refreshing = false;
        state.apps = action.payload;
        state.currentPage = 1;
        state.hasMore = action.payload.length === 10;
      })
      .addCase(refreshApps.rejected, (state, action) => {
        state.refreshing = false;
        state.error = action.payload as string;
      });

    // Create app
    builder
      .addCase(createApp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createApp.fulfilled, (state, action) => {
        state.loading = false;
        state.apps = [action.payload, ...state.apps];
      })
      .addCase(createApp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update app
    builder
      .addCase(updateApp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateApp.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.apps.findIndex(app => app.id === action.payload.id);
        if (index !== -1) {
          state.apps[index] = action.payload;
        }
      })
      .addCase(updateApp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete app
    builder
      .addCase(deleteApp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteApp.fulfilled, (state, action) => {
        state.loading = false;
        state.apps = state.apps.filter(app => app.id !== action.payload);
      })
      .addCase(deleteApp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Search apps
    builder
      .addCase(searchApps.pending, (state) => {
        state.searching = true;
        state.error = null;
      })
      .addCase(searchApps.fulfilled, (state, action) => {
        state.searching = false;
        state.apps = action.payload.apps;
        state.searchQuery = action.payload.query;
        state.currentPage = 1;
        state.hasMore = action.payload.apps.length === 10;
      })
      .addCase(searchApps.rejected, (state, action) => {
        state.searching = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAppsError } = appsSlice.actions;
export default appsSlice.reducer;
