import { useInfiniteQuery, useQuery, useMutation } from "@tanstack/react-query"
import { useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import useSWR from "swr"
import { toast } from "sonner"

const fetcher = async (url) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.')
    error.info = await res.json()
    error.status = res.status
    throw error
  }
  return res.json()
}

// Hook for fetching paginated products with filters
export function useProducts(filters = {}) {
  const fetchProducts = async ({ pageParam = 1 }) => {
    const queryParams = new URLSearchParams();
    
    queryParams.append("page", pageParam);
    queryParams.append("limit", 12);
    
    if (filters.type) {
      queryParams.append("type", filters.type);
    }
    
    if (filters.categoryId) {
      queryParams.append("categoryId", filters.categoryId);
    }
    
    if (filters.search) {
      queryParams.append("search", filters.search);
    }
    
    if (filters.sortBy) {
      queryParams.append("sortBy", filters.sortBy);
    }
    
    if (filters.order) {
      queryParams.append("order", filters.order);
    }
    
    if (filters.minPrice) {
      queryParams.append("minPrice", filters.minPrice);
    }
    
    if (filters.maxPrice) {
      queryParams.append("maxPrice", filters.maxPrice);
    }
    
    queryParams.append("include", "ticketTypes");
    
    const response = await fetch(`/api/products?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    
    return response.json();
  };

  return useInfiniteQuery({
    queryKey: ["products", filters],
    queryFn: fetchProducts,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.currentPage < lastPage.pagination.totalPages) {
        return lastPage.pagination.currentPage + 1;
      }
      return undefined;
    },
    enabled: true,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
}

// Hook for fetching a single product
export function useProduct(id) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!id) return null;
      
      try {
        const response = await fetch(`/api/products/${id}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch product");
        }
        
        return data;
      } catch (error) {
        console.error("Error fetching product:", error);
        throw error;
      }
    },
    enabled: !!id,
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook for creating a new product
export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productData) => {
      const { media, content, settings, ...restData } = productData;
      
      // Validate required media
      if (!media?.thumbnail) {
        throw new Error('Thumbnail is required');
      }

      // Prepare the request data
      const requestData = {
        ...restData,
        media: {
          thumbnail: media.thumbnail,
          coverPhoto: media.coverPhoto || null,
          gallery: media.gallery || []
        },
        content: content || [],
        settings: settings || {}
      };

      const { data } = await axios.post('/api/products', requestData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['products']);
      toast.success('Product created successfully');
    },
    onError: (error) => {
      console.error('Create product error:', error);
      toast.error(error.message || 'Failed to create product');
    }
  });
}

// Hook for updating a product
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...productData }) => {
      try {
        const { data } = await axios.patch(`/api/products/${id}`, productData);
        return data;
      } catch (error) {
        console.error('Error updating product:', error.response?.data || error.message);
        throw new Error(error.response?.data?.error || error.message || 'Failed to update product');
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['products']);
      queryClient.invalidateQueries(['product', data.id]);
      toast.success('Product updated successfully');
    }
  });
}

// Hook for toggling product status (active/inactive)
export function useToggleProductStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await fetch(`/api/products/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        const error = new Error(data.error || 'Failed to update product status');
        error.status = response.status;
        error.data = data;
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success('Product status updated successfully');
    }
  });
}

// Hook for fetching seller's products
export function useSellerProducts(sellerId, excludeId) {
  const { data, error, isLoading } = useSWR(
    sellerId ? `/api/sellers/${sellerId}/products?excludeId=${excludeId}` : null,
    fetcher
  );

  return {
    products: data?.products || [],
    isLoading,
    isError: error
  };
}

// Hook for fetching similar products
export function useSimilarProducts(productId, type, categoryId) {
  return useQuery({
    queryKey: ["similar-products", productId, type, categoryId],
    queryFn: async () => {
      if (!productId) return [];
      
      const params = new URLSearchParams();
      if (type) params.append("type", type);
      if (categoryId) params.append("categoryId", categoryId);
      params.append("excludeId", productId);
      params.append("limit", 3);
      
      const response = await fetch(`/api/products/similar?${params.toString()}`);
      const data = await response.json();
      
      if (!response.ok) return [];
      
      return data.products || [];
    },
    enabled: !!productId,
    refetchOnWindowFocus: false
  });
}
