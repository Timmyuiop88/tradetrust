import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// Mock KYC store (replace with your database later)
let kycVerifications = new Map()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    // Debug session
    console.log("Session in KYC status:", JSON.stringify(session, null, 2))
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Make sure we have a user ID
    const userId = session.user.id
    if (!userId) {
      console.error('No user ID in session:', session)
      return NextResponse.json({ error: 'Invalid session' }, { status: 400 })
    }

    // Find the user with their KYC data
    const user = await prisma.user.findUnique({
      where: { id: userId },
     
    })

    if (!user) {
      console.error('User not found with ID:', userId)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Format the KYC steps based on the user's KYC data
   

    return NextResponse.json({ isKycVerified: user.isKycVerified, isEmailVerified: user.isEmailVerified })
  } catch (error) {
    console.error('KYC status error:', error)
    return NextResponse.json({ error: 'Failed to fetch KYC status' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Try to get the user ID from different possible locations
    const userId = session.user.id || session.user.userId || session.userId
    
    if (!userId) {
      return NextResponse.json({ error: 'Invalid session structure' }, { status: 400 })
    }

    const data = await request.json()
    
    // Check if KYC record exists
    const existingKyc = await prisma.kyc.findUnique({
      where: { userId: userId }
    })

    let kyc
    
    if (existingKyc) {
      // Update existing KYC record
      kyc = await prisma.kyc.update({
        where: { userId: userId },
        data: {
          ...data,
          updatedAt: new Date()
        }
      })
    } else {
      // Create new KYC record
      kyc = await prisma.kyc.create({
        data: {
          ...data,
          userId: userId,
          fullName: data.fullName || "User" // Required field
        }
      })
    }

    // Check if all KYC steps are completed
    const isFullyVerified = kyc.idDocUrl && kyc.address && data.verified;
    
    if (isFullyVerified || data.verified) {
      // Update user's KYC verification status
      await prisma.user.update({
        where: { id: userId },
        data: { isKycVerified: true }
      });
    }

    return NextResponse.json(kyc)
  } catch (error) {
    console.error('KYC POST error:', error)
    return NextResponse.json({ error: 'Failed to update KYC' }, { status: 500 })
  }
} 