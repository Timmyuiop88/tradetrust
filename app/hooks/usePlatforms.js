import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

export function usePlatforms() {
  return useQuery({
    queryKey: ['platforms'],
    queryFn: async () => {
      const { data } = await axios.get('/api/platforms')
      return data
    }
  })
}

export function useCreatePlatform() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (platformData) => {
      const { data } = await axios.post('/api/platforms', platformData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['platforms'])
    }
  })
} 