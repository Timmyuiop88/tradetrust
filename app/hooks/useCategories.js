import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await axios.get('/api/categories')
      return data
    }
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (categoryData) => {
      const { data } = await axios.post('/api/categories', categoryData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['categories'])
    }
  })
} 