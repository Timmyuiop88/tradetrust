import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

export function useFollow() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  // Check if current user is following a specific user
  const useIsFollowing = (userId) => {
    return useQuery({
      queryKey: ['isFollowing', currentUserId, userId],
      queryFn: async () => {
        if (!currentUserId || !userId) return false;
        
        try {
          const response = await fetch(`/api/users/${userId}/followers`);
          if (!response.ok) return false;
          
          const data = await response.json();
          return data.followers.some(user => user.id === currentUserId);
        } catch (error) {
          console.error('Error checking follow status:', error);
          return false;
        }
      },
      enabled: !!currentUserId && !!userId && currentUserId !== userId,
    });
  };

  // Get followers count
  const useFollowersCount = (userId) => {
    return useQuery({
      queryKey: ['followersCount', userId],
      queryFn: async () => {
        if (!userId) return 0;
        
        const response = await fetch(`/api/users/${userId}/followers?limit=1`);
        if (!response.ok) throw new Error('Failed to fetch followers count');
        
        const data = await response.json();
        return data.pagination.totalCount;
      },
      enabled: !!userId,
    });
  };

  // Get following count
  const useFollowingCount = (userId) => {
    return useQuery({
      queryKey: ['followingCount', userId],
      queryFn: async () => {
        if (!userId) return 0;
        
        const response = await fetch(`/api/users/${userId}/following?limit=1`);
        if (!response.ok) throw new Error('Failed to fetch following count');
        
        const data = await response.json();
        return data.pagination.totalCount;
      },
      enabled: !!userId,
    });
  };

  // Get followers list with pagination
  const useGetFollowers = (userId, page = 1, limit = 20) => {
    return useQuery({
      queryKey: ['followers', userId, page, limit],
      queryFn: async () => {
        if (!userId) return { followers: [], pagination: { totalCount: 0 } };
        
        const response = await fetch(`/api/users/${userId}/followers?page=${page}&limit=${limit}`);
        if (!response.ok) throw new Error('Failed to fetch followers');
        
        return response.json();
      },
      enabled: !!userId,
    });
  };

  // Get following list with pagination
  const useGetFollowing = (userId, page = 1, limit = 20) => {
    return useQuery({
      queryKey: ['following', userId, page, limit],
      queryFn: async () => {
        if (!userId) return { following: [], pagination: { totalCount: 0 } };
        
        const response = await fetch(`/api/users/${userId}/following?page=${page}&limit=${limit}`);
        if (!response.ok) throw new Error('Failed to fetch following');
        
        return response.json();
      },
      enabled: !!userId,
    });
  };

  // Follow a user
  const useFollowUser = () => {
    return useMutation({
      mutationFn: async (userId) => {
        if (!currentUserId) throw new Error('You must be logged in to follow users');
        
        const response = await fetch(`/api/users/${userId}/follow`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to follow user');
        }
        
        return response.json();
      },
      onSuccess: (_, userId) => {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['isFollowing', currentUserId, userId] });
        queryClient.invalidateQueries({ queryKey: ['followersCount', userId] });
        queryClient.invalidateQueries({ queryKey: ['followingCount', currentUserId] });
        queryClient.invalidateQueries({ queryKey: ['followers', userId] });
        queryClient.invalidateQueries({ queryKey: ['following', currentUserId] });
      },
    });
  };

  // Unfollow a user
  const useUnfollowUser = () => {
    return useMutation({
      mutationFn: async (userId) => {
        if (!currentUserId) throw new Error('You must be logged in to unfollow users');
        
        const response = await fetch(`/api/users/${userId}/follow`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to unfollow user');
        }
        
        return response.json();
      },
      onSuccess: (_, userId) => {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['isFollowing', currentUserId, userId] });
        queryClient.invalidateQueries({ queryKey: ['followersCount', userId] });
        queryClient.invalidateQueries({ queryKey: ['followingCount', currentUserId] });
        queryClient.invalidateQueries({ queryKey: ['followers', userId] });
        queryClient.invalidateQueries({ queryKey: ['following', currentUserId] });
      },
    });
  };

  return {
    useIsFollowing,
    useFollowersCount,
    useFollowingCount,
    useGetFollowers,
    useGetFollowing,
    useFollowUser,
    useUnfollowUser,
  };
} 