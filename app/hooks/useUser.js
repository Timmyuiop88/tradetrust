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
        
        // Fetch additional user details
        const { data } = await axios.get('/api/users/me')
        
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
        // Return session data as fallback
        return session?.user || { error: error.message }
      }
    },
    enabled: status === 'authenticated',
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  })
} 