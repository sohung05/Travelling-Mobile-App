import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * QueryClient configuration for React Query
 * Handles caching, stale time, and error retry logic
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,        // 5 phút - data được coi là fresh trong 5 phút
      gcTime: 10 * 60 * 1000,          // 10 phút - cache time (trước đây là cacheTime)
      retry: 1,                         // Retry 1 lần nếu fail
      refetchOnWindowFocus: false,      // React Native không cần refetch khi focus
      refetchOnReconnect: true,         // Refetch khi reconnect
      refetchOnMount: true,             // Refetch khi component mount (nếu stale)
    },
    mutations: {
      retry: 1,
    },
  },
});

/**
 * AsyncStorage Persister
 * Giữ cache khi đóng app, persist vào AsyncStorage
 */
export const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'travel-app-cache',
  throttleTime: 1000, // Throttle writes to AsyncStorage
});

