import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Re-export authOptions for backward compatibility
export { authOptions }

// Export the NextAuth handler directly
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }