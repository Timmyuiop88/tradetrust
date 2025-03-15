import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '../../../../lib/prisma'
import { compare } from 'bcryptjs'
import { SubscriptionService } from '@/lib/services/subscriptionService'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { kyc: true }
        })

        if (!user || !(await compare(credentials.password, user.password))) {
          throw new Error('Invalid credentials')
        }

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isKycVerified: user.isKycVerified || false,
          isEmailVerified: user.isEmailVerified || false
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.isEmailVerified = user.isEmailVerified
        token.isKycVerified = user.isKycVerified
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.firstName = token.firstName
        session.user.lastName = token.lastName
        session.user.isEmailVerified = token.isEmailVerified
        session.user.isKycVerified = token.isKycVerified
      }
      return session
    },
    async signIn({ user }) {
      // Ensure user has a subscription
      const subscription = await prisma.subscription.findFirst({
        where: { userId: user.id }
      })

      if (!subscription) {
        // Get the FREE plan
        const freePlan = await prisma.plan.findFirst({
          where: { tier: 'FREE' }
        })

        // Create subscription
        await prisma.subscription.create({
          data: {
            userId: user.id,
            planId: freePlan.id,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            status: 'ACTIVE'
          }
        })
      }

      return true
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST } 