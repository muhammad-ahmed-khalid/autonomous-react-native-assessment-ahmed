import { create } from 'apisauce';
import { LoginCredentials, User } from '@/types/auth';
import { App } from '@/types/app';

const API_BASE_URL = 'https://dummyjson.com';

const api = create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  login: async (credentials: LoginCredentials): Promise<User> => {
    const response = await api.post('/auth/login', credentials);
    if (!response.ok) {
      throw new Error((response.data as any)?.message || 'Login failed');
    }
    return response.data as User;
  },

  getCurrentUser: async (token: string): Promise<User> => {
    const response = await api.get('/auth/me', {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error((response.data as any)?.message || 'Failed to get user');
    }
    return response.data as User;
  },

  // DummyJSON doesn't have a real registration endpoint,
  // so we'll simulate it and then use a default login
  register: async (userData: any): Promise<User> => {
    // Simulate registration - in real app this would create a user
    // For demo, we'll use a default DummyJSON user
    const response = await api.post('/auth/login', {
      username: 'emilys',
      password: 'emilyspass',
    });
    if (!response.ok) {
      throw new Error((response.data as any)?.message || 'Registration failed');
    }
    return response.data as User;
  },
};

export const appService = {
  getApps: async (page: number = 1, limit: number = 10): Promise<App[]> => {
    // Using DummyJSON products as mock apps
    const skip = (page - 1) * limit;
    const response = await api.get(`/products?limit=${limit}&skip=${skip}`);
    if (!response.ok) {
      throw new Error((response.data as any)?.message || 'Failed to fetch apps');
    }
    
    const products = (response.data as any)?.products || [];
    
    // Transform products into apps
    const apps: App[] = products.map((product: any, index: number) => ({
      id: product.id.toString(),
      name: product.title,
      logo: product.thumbnail,
      subscriptionStatus: ['active', 'inactive', 'trial', 'expired'][index % 4] as App['subscriptionStatus'],
      lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      description: product.description,
    }));
    
    return apps;
  },

  searchApps: async (query: string, page: number = 1, limit: number = 10): Promise<App[]> => {
    // Using DummyJSON search endpoint
    const response = await api.get(`/products/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    if (!response.ok) {
      throw new Error((response.data as any)?.message || 'Failed to search apps');
    }
    
    const products = (response.data as any)?.products || [];
    
    // Transform products into apps
    const apps: App[] = products.map((product: any, index: number) => ({
      id: product.id.toString(),
      name: product.title,
      logo: product.thumbnail,
      subscriptionStatus: ['active', 'inactive', 'trial', 'expired'][index % 4] as App['subscriptionStatus'],
      lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      description: product.description,
    }));
    
    return apps;
  },

  getAppById: async (id: string): Promise<App> => {
    const response = await api.get(`/products/${id}`);
    if (!response.ok) {
      throw new Error((response.data as any)?.message || 'Failed to fetch app');
    }
    
    const product = response.data as any;
    return {
      id: product.id.toString(),
      name: product.title,
      logo: product.thumbnail,
      subscriptionStatus: 'active',
      lastUpdated: new Date().toISOString(),
      description: product.description,
    };
  },

  createApp: async (appData: Partial<App>): Promise<App> => {
    // DummyJSON allows adding products
    const response = await api.post('/products/add', {
      title: appData.name,
      description: appData.description,
      thumbnail: appData.logo,
    });
    
    if (!response.ok) {
      throw new Error((response.data as any)?.message || 'Failed to create app');
    }
    
    const product = response.data as any;
    return {
      id: product.id.toString(),
      name: product.title,
      logo: product.thumbnail || appData.logo || 'https://via.placeholder.com/150',
      subscriptionStatus: appData.subscriptionStatus || 'active',
      lastUpdated: new Date().toISOString(),
      description: product.description,
    };
  },

  updateApp: async (id: string, appData: Partial<App>): Promise<App> => {
    // DummyJSON allows updating products
    const response = await api.put(`/products/${id}`, {
      title: appData.name,
      description: appData.description,
      thumbnail: appData.logo,
    });
    
    if (!response.ok) {
      throw new Error((response.data as any)?.message || 'Failed to update app');
    }
    
    const product = response.data as any;
    return {
      id: product.id.toString(),
      name: product.title || appData.name || '',
      logo: product.thumbnail || appData.logo || 'https://via.placeholder.com/150',
      subscriptionStatus: appData.subscriptionStatus || 'active',
      lastUpdated: new Date().toISOString(),
      description: product.description || appData.description,
    };
  },

  deleteApp: async (id: string): Promise<void> => {
    const response = await api.delete(`/products/${id}`);
    if (!response.ok) {
      throw new Error((response.data as any)?.message || 'Failed to delete app');
    }
  },
};

export default api;
