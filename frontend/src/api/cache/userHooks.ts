import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { User } from '../../types';
import { userService } from '../userService';

/**
 * Custom hooks for user using React Query
 * Giữ nguyên logic của userService, chỉ thêm caching layer
 */

/**
 * Hook để lấy user profile by ID
 * Cache: 5 phút (user data có thể thay đổi thường xuyên)
 */
export const useUser = (userId: string | undefined) => {
  return useQuery<User | undefined>({
    queryKey: ['users', 'profile', userId],
    queryFn: async () => {
      if (!userId) return undefined;
      // Giữ nguyên logic hiện tại của userService
      return await userService.getCurrentUser(userId);
    },
    enabled: !!userId, // Chỉ fetch khi có userId
    staleTime: 5 * 60 * 1000, // 5 phút
    gcTime: 15 * 60 * 1000,    // 15 phút cache time
  });
};

/**
 * Hook để update user profile
 * Sử dụng mutation để invalidate cache sau khi update
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Partial<User> }) => {
      // Giữ nguyên logic hiện tại của userService
      return await userService.updateUser(userId, updates);
    },
    onSuccess: (data, variables) => {
      // Invalidate user cache sau khi update thành công
      queryClient.invalidateQueries({ queryKey: ['users', 'profile', variables.userId] });
      // Có thể cần invalidate all users nếu có list users
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

/**
 * Utility function để invalidate user cache
 * Dùng khi có thay đổi user data
 */
export const useInvalidateUser = () => {
  const queryClient = useQueryClient();
  
  return (userId?: string) => {
    if (userId) {
      // Invalidate specific user
      queryClient.invalidateQueries({ queryKey: ['users', 'profile', userId] });
    } else {
      // Invalidate all users queries
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  };
};

