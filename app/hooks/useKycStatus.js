import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import axios from "axios"

export function useKycStatus() {
  const { data: session } = useSession()
  
  return useQuery({
    queryKey: ['kyc-status'],
    queryFn: async () => {
      const { data } = await axios.get('/api/users/kyc')
      return data
    },
    enabled: !!session?.user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
} 