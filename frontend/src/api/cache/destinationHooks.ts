import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Destination } from '../../types';
import { destinationService } from '../destinationService';

/**
 * Custom hooks for destinations using React Query
 * Giữ nguyên logic của destinationService, chỉ thêm caching layer
 */

/**
 * Hook để lấy tất cả destinations
 * Cache: 10 phút
 */
export const useDestinations = () => {
  return useQuery<Destination[]>({
    queryKey: ['destinations', 'all'],
    queryFn: async () => {
      // Giữ nguyên logic hiện tại của destinationService
      return await destinationService.getAllDestinations();
    },
    staleTime: 10 * 60 * 1000, // 10 phút
    gcTime: 30 * 60 * 1000,    // 30 phút cache time
  });
};

/**
 * Hook để lấy featured destinations
 * Cache: 10 phút
 */
export const useFeaturedDestinations = () => {
  return useQuery<Destination[]>({
    queryKey: ['destinations', 'featured'],
    queryFn: async () => {
      // Giữ nguyên logic hiện tại của destinationService
      return await destinationService.getFeaturedDestinations();
    },
    staleTime: 10 * 60 * 1000, // 10 phút
    gcTime: 30 * 60 * 1000,    // 30 phút cache time
  });
};

/**
 * Hook để lấy popular destinations
 * Cache: 10 phút
 */
export const usePopularDestinations = () => {
  return useQuery<Destination[]>({
    queryKey: ['destinations', 'popular'],
    queryFn: async () => {
      // Giữ nguyên logic hiện tại của destinationService
      return await destinationService.getPopularDestinations();
    },
    staleTime: 10 * 60 * 1000, // 10 phút
    gcTime: 30 * 60 * 1000,    // 30 phút cache time
  });
};

/**
 * Hook để lấy destination by ID
 * Cache: 10 phút
 */
export const useDestination = (id: string | undefined) => {
  return useQuery<Destination | undefined>({
    queryKey: ['destinations', 'detail', id],
    queryFn: async () => {
      if (!id) return undefined;
      // Giữ nguyên logic hiện tại của destinationService
      return await destinationService.getDestinationById(id);
    },
    enabled: !!id, // Chỉ fetch khi có id
    staleTime: 10 * 60 * 1000, // 10 phút
    gcTime: 30 * 60 * 1000,    // 30 phút cache time
  });
};

/**
 * Hook để lấy destinations by category
 * Cache: 10 phút
 */
export const useDestinationsByCategory = (category: string | null) => {
  return useQuery<Destination[]>({
    queryKey: ['destinations', 'category', category],
    queryFn: async () => {
      if (!category) return [];
      // Giữ nguyên logic hiện tại của destinationService
      return await destinationService.getDestinationsByCategory(category as any);
    },
    enabled: !!category, // Chỉ fetch khi có category
    staleTime: 10 * 60 * 1000, // 10 phút
    gcTime: 30 * 60 * 1000,    // 30 phút cache time
  });
};

/**
 * Hook để search destinations
 * Cache: 5 phút (search results thay đổi thường xuyên hơn)
 */
export const useSearchDestinations = (filters: any) => {
  return useQuery<Destination[]>({
    queryKey: ['destinations', 'search', filters],
    queryFn: async () => {
      // Giữ nguyên logic hiện tại của destinationService
      return await destinationService.searchDestinations(filters);
    },
    enabled: !!filters, // Chỉ fetch khi có filters
    staleTime: 5 * 60 * 1000, // 5 phút
    gcTime: 10 * 60 * 1000,    // 10 phút cache time
  });
};

/**
 * Utility function để invalidate destinations cache
 * Dùng khi có thay đổi (ví dụ: admin thêm/sửa/xóa tour)
 */
export const useInvalidateDestinations = () => {
  const queryClient = useQueryClient();
  
  return () => {
    // Invalidate tất cả destinations queries
    queryClient.invalidateQueries({ queryKey: ['destinations'] });
  };
};

