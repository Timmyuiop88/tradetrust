import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

export function useKycStatus() {
  return useQuery({
    queryKey: ['kyc-status'],
    queryFn: async () => {
      const { data } = await axios.get('/api/users/kyc')
      return data
    }
  })
}

export function useKycSubmit() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (stepData) => {
      const { data } = await axios.post('/api/users/kyc', stepData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['kyc-status'])
    }
  })
} 