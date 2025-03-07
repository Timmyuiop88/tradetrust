import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useSession } from 'next-auth/react'

export function useUser() {
  const { data: session, status } = useSession()
  
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      try {
        if (!session?.user?.id) {
          return null
        }
        
        // Fetch additional user details from API with credentials
        const { data } = await axios.get('/api/users/me', {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        })
        
        // Ensure KYC data is properly structured
        const kycData = data.kyc || null
        
        // Format the user data
        return {
          ...session.user,
          ...data,
          kyc: kycData,
          createdAt: data.createdAt || null,
          isKycVerified: data.isKycVerified || false
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
        console.error('Error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        })
        // Return session data as fallback
        return session?.user || { error: error.message }
      }
    },
    enabled: status === 'authenticated' && !!session?.user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  })
} 