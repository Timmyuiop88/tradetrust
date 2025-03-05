import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { kyc: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

 

    return NextResponse.json({ isKycVerified: user.isKycVerified, isEmailVerified: user.isEmailVerified })
  } catch (error) {
    console.error('KYC status error:', error)
    return NextResponse.json({ error: 'Failed to fetch KYC status' }, { status: 500 })
  }
} 