import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

export function usePayoutSettings() {
  return useQuery({
    queryKey: ['payout-settings'],
    queryFn: async () => {
      try {
        const { data } = await axios.get('/api/users/payout-settings')
        return data || [] // Ensure we return an empty array if data is falsy
      } catch (error) {
        console.error('Error fetching payout settings:', error)
        return [] // Return empty array on error
      }
    },
    // Default to empty array if the query fails or returns undefined
    initialData: []
  })
}

export function useUpdatePayoutSettings() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data) => {
      const config = {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      };
      
      if (data.delete) {
        await axios.delete(`/api/users/payout-settings?id=${data.id}`, config)
        return { success: true }
      }
      
      if (data.id) {
        const { data: response } = await axios.put('/api/users/payout-settings', data, config)
        return response
      } else {
        const { data: response } = await axios.post('/api/users/payout-settings', data, config)
        return response
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payout-settings'] })
    }
  })
} 