import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '../../../../lib/prisma'
import { compare } from 'bcryptjs'
import { authConfig } from '../../../providers'

export const authOptions = {
  ...authConfig,
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
          role: user.role,
          kycVerified: user.kyc?.verified || false
        }
      }
    })
  ]
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST } 