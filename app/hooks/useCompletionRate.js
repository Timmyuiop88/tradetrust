import { useQuery } from "@tanstack/react-query";

export function useCompletionRate(userId) {
  const fetchCompletionRate = async () => {
    if (!userId) {
      throw new Error("User ID is required");
    }
    
    const response = await fetch(`/api/users/${userId}/completion-rate`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch completion rate");
    }
    
    return response.json();
  };

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["completionRate", userId],
    queryFn: fetchCompletionRate,
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Determine if user is a seller based on data
  const isSeller = data ? 
    (data.totalOrders > 0 || (data.totalListings !== undefined && data.totalListings > 0)) 
    : false;

  return {
    stats: data,
    isLoading,
    error,
    isSeller,
  };
} 