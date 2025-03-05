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
    
    const data = await request.json()
    
    // Find existing KYC record
    let kyc = await prisma.kyc.findUnique({
      where: { userId: session.user.id }
    })
    
    // Handle document URLs as JSON
    if (data.governmentIdUrl || data.faceImageUrl || data.addressDocUrl) {
      const currentDocs = kyc?.idDocUrl ? JSON.parse(kyc.idDocUrl) : {}
      const updatedDocs = {
        ...currentDocs,
        ...(data.governmentIdUrl && { governmentId: data.governmentIdUrl }),
        ...(data.faceImageUrl && { faceScan: data.faceImageUrl }),
        ...(data.addressDocUrl && { addressProof: data.addressDocUrl })
      }
      data.idDocUrl = JSON.stringify(updatedDocs)
    }
    
    // Set default values for required fields if not provided
    if (!data.fullName && kyc?.fullName) data.fullName = kyc.fullName
    if (!data.idType && kyc?.idType) data.idType = kyc.idType
    if (!data.idNumber && kyc?.idNumber) data.idNumber = kyc.idNumber
    
    // If this is a new record and we don't have required fields yet
    if (!kyc && (!data.fullName || !data.idType || !data.idNumber)) {
      return NextResponse.json({ 
        error: 'Missing required information for new KYC record' 
      }, { status: 400 })
    }
    
    // Update or create KYC record
    if (kyc) {
      kyc = await prisma.kyc.update({
        where: { userId: session.user.id },
        data: {
          ...data,
          updatedAt: new Date()
        }
      })
    } else {
      kyc = await prisma.kyc.create({
        data: {
          userId: session.user.id,
          ...data,
          verified: false
        }
      })
    }
    
    // Check if all required documents are uploaded
    const docs = JSON.parse(kyc.idDocUrl || '{}')
    const isComplete = docs.governmentId && docs.faceScan && docs.addressProof
    
    // Update user's KYC status if all documents are uploaded
    if (isComplete) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { isKycVerified: true }
      });
    }

    return NextResponse.json(kyc)
  } catch (error) {
    console.error('KYC POST error:', error)
    return NextResponse.json({ error: 'Failed to update KYC' }, { status: 500 })
  }
} 