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
        // Log the data being sent to API
        console.log('Submitting KYC data:', stepData)
        
        // Create a copy of the data to transform if needed
        const submissionData = { ...stepData }
        
        // Make sure we're passing address document URL properly
        if (submissionData.addressDocUrl) {
          // Keep the addressDocUrl field for the API to process correctly
          console.log('Address document URL included:', submissionData.addressDocUrl)
        }
        
        // Log if we're including the full name
        if (submissionData.fullName) {
          console.log('Full name included:', submissionData.fullName)
        }
        
        const { data } = await axios.post('/api/kyc/insert', submissionData)
        return data
      } catch (error) {
        const errorInfo = {
          message: error.message || 'Unknown error',
          data: stepData
        }
        
        if (error.response) {
          errorInfo.responseData = error.response.data
          errorInfo.status = error.response.status
        }
        
        console.error('KYC submission error:', errorInfo)
        
        throw new Error(error.response?.data?.error || error.message || 'Failed to submit KYC information')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['kyc-status'])
    }
  })
}