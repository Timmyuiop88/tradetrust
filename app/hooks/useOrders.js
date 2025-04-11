import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/app/components/custom-toast";
import { useRouter } from "next/navigation";

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  return useMutation({
    mutationFn: async ({ listingId }) => {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          listingId
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to create order");
      }
      
     
      
      return data;
    },
    onSuccess: (data) => {
      toast.success("Order created successfully!");
      router.push(`/dashboard/orders/${data.orderId}`);
      // Invalidate orders queries
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      return data;
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong");
      return error;
    }
  });
} 