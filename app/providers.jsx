"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import { EdgeStoreProvider } from '@/app/lib/edgeStore'
import { ToastProvider } from '@/app/components/custom-toast'
import { Toaster } from 'sonner'
// Configure React Query defaults
const queryConfig = {
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      cacheTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      networkMode: 'always',
    },
  },
}

// Configure NextAuth session callback
const authConfig = {
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.sub
        session.user.role = token.role
        session.user.isKycVerified = token.isKycVerified
        session.user.isEmailVerified = token.isEmailVerified
      }
      return session
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role
        token.isKycVerified = user.isKycVerified
        token.isEmailVerified = user.isEmailVerified
      }
      return token
    }
  },
  pages: {
    signIn: '/login',
    signUp: '/signup',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  }
}

export function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient(queryConfig))

  return (
    <SessionProvider refetchInterval={5 * 60}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <EdgeStoreProvider>
            <ToastProvider/>
            <Toaster position="top-right" richColors closeButton />
              {children}
        
 
          </EdgeStoreProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  )
}

// Export auth config for backend usage
export { authConfig } 