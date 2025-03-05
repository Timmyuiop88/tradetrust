import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// Mock KYC store (replace with your database later)
let kycVerifications = new Map()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const kyc = await prisma.kyc.findUnique({
      where: { userId: session.user.id }
    })

    return NextResponse.json(kyc || { status: 'pending' })
  } catch (error) {
    console.error('KYC GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch KYC status' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    const kyc = await prisma.kyc.upsert({
      where: { userId: session.user.id },
      update: {
        ...data,
        updatedAt: new Date()
      },
      create: {
        ...data,
        userId: session.user.id
      }
    })

    return NextResponse.json(kyc)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update KYC' }, { status: 500 })
  }
} 