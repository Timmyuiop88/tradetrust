import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useSession } from 'next-auth/react'

export function useKycStatus() {
  const { data: session, status } = useSession()
  console.log(session)
  return useQuery({
    queryKey: ['kyc-status'],
    queryFn: async () => {
      try {
        const { data } = await axios.get('/api/kyc/status')
        return data
      } catch (error) {
        console.error('Error fetching KYC status:', error)
        return { error: error }
      }
    },
    enabled: status === 'authenticated' && !!session?.user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useKycSubmit() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (stepData) => {
      try {
        const { data } = await axios.post('/api/kyc/insert', stepData)
        return data
      } catch (error) {
        console.error('KYC submission error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          data: stepData
        })
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['kyc-status'])
    }
  })
} 