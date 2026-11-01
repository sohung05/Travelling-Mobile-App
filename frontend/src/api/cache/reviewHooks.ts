import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Review } from '../../types';
import { reviewService, CreateReviewRequest, UpdateReviewRequest } from '../reviewService';

/**
 * Custom hooks for reviews using React Query
 * Giữ nguyên logic của reviewService, chỉ thêm caching layer
 */

/**
 * Hook để lấy reviews by destination ID
 * Cache: 5 phút (reviews có thể thay đổi thường xuyên)
 */
export const useReviewsByDestination = (destinationId: string | undefined) => {
  return useQuery<Review[]>({
    queryKey: ['reviews', 'destination', destinationId],
    queryFn: async () => {
      if (!destinationId) return [];
      // Giữ nguyên logic hiện tại của reviewService
      return await reviewService.getReviewsByDestination(destinationId);
    },
    enabled: !!destinationId, // Chỉ fetch khi có destinationId
    staleTime: 5 * 60 * 1000, // 5 phút
    gcTime: 10 * 60 * 1000,    // 10 phút cache time
  });
};

/**
 * Hook để lấy reviews by user ID
 * Cache: 5 phút
 */
export const useUserReviews = (userId: string | undefined) => {
  return useQuery<Review[]>({
    queryKey: ['reviews', 'user', userId],
    queryFn: async () => {
      if (!userId) return [];
      // Giữ nguyên logic hiện tại của reviewService
      return await reviewService.getUserReviews(userId);
    },
    enabled: !!userId, // Chỉ fetch khi có userId
    staleTime: 5 * 60 * 1000, // 5 phút
    gcTime: 10 * 60 * 1000,    // 10 phút cache time
  });
};

/**
 * Hook để lấy review của user cho một destination cụ thể
 * Cache: 5 phút
 */
export const useUserReviewForDestination = (
  userId: string | undefined,
  destinationId: string | undefined
) => {
  return useQuery<Review | null>({
    queryKey: ['reviews', 'user', userId, 'destination', destinationId],
    queryFn: async () => {
      if (!userId || !destinationId) return null;
      // Giữ nguyên logic hiện tại của reviewService
      return await reviewService.getUserReviewForDestination(userId, destinationId);
    },
    enabled: !!userId && !!destinationId, // Chỉ fetch khi có cả userId và destinationId
    staleTime: 5 * 60 * 1000, // 5 phút
    gcTime: 10 * 60 * 1000,    // 10 phút cache time
  });
};

/**
 * Hook để lấy review by ID
 * Cache: 5 phút
 */
export const useReview = (reviewId: string | undefined) => {
  return useQuery<Review | undefined>({
    queryKey: ['reviews', 'detail', reviewId],
    queryFn: async () => {
      if (!reviewId) return undefined;
      // Giữ nguyên logic hiện tại của reviewService
      return await reviewService.getReviewById(reviewId);
    },
    enabled: !!reviewId, // Chỉ fetch khi có reviewId
    staleTime: 5 * 60 * 1000, // 5 phút
    gcTime: 10 * 60 * 1000,    // 10 phút cache time
  });
};

/**
 * Hook để create review
 * Sử dụng mutation để invalidate cache sau khi create
 */
export const useCreateReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reviewData: CreateReviewRequest) => {
      // Giữ nguyên logic hiện tại của reviewService
      return await reviewService.createReview(reviewData);
    },
    onSuccess: (data) => {
      // Invalidate reviews cache sau khi create thành công
      queryClient.invalidateQueries({ queryKey: ['reviews', 'destination', data.destinationId] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'user', data.userId] });
      // Invalidate user review for destination cache
      queryClient.invalidateQueries({ 
        queryKey: ['reviews', 'user', data.userId, 'destination', data.destinationId] 
      });
      // Invalidate destinations cache vì rating có thể thay đổi
      queryClient.invalidateQueries({ queryKey: ['destinations'] });
    },
  });
};

/**
 * Hook để update review
 * Sử dụng mutation để invalidate cache sau khi update
 */
export const useUpdateReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ reviewId, reviewData }: { reviewId: string; reviewData: UpdateReviewRequest }) => {
      // Giữ nguyên logic hiện tại của reviewService
      return await reviewService.updateReview(reviewId, reviewData);
    },
    onSuccess: (data) => {
      // Invalidate reviews cache sau khi update thành công
      queryClient.invalidateQueries({ queryKey: ['reviews', 'destination', data.destinationId] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'user', data.userId] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'detail', data.id] });
      // Invalidate destinations cache vì rating có thể thay đổi
      queryClient.invalidateQueries({ queryKey: ['destinations'] });
    },
  });
};

/**
 * Hook để delete review
 * Sử dụng mutation để invalidate cache sau khi delete
 */
export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reviewId: string) => {
      // Giữ nguyên logic hiện tại của reviewService
      return await reviewService.deleteReview(reviewId);
    },
    onSuccess: () => {
      // Invalidate all reviews cache sau khi delete thành công
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      // Invalidate destinations cache vì rating có thể thay đổi
      queryClient.invalidateQueries({ queryKey: ['destinations'] });
    },
  });
};

/**
 * Utility function để invalidate reviews cache
 * Dùng khi có thay đổi reviews
 */
export const useInvalidateReviews = () => {
  const queryClient = useQueryClient();
  
  return (destinationId?: string, userId?: string) => {
    if (destinationId) {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'destination', destinationId] });
    }
    if (userId) {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'user', userId] });
    }
    if (!destinationId && !userId) {
      // Invalidate all reviews queries
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    }
  };
};

