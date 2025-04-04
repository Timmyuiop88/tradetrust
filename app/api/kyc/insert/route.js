import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    console.log('KYC data received:', data)
    
    const existingKyc = await prisma.kyc.findUnique({
      where: { userId: session.user.id }
    })

    // Initialize or parse existing documents
    let currentDocs = {}
    if (existingKyc?.idDocUrl) {
      try {
        currentDocs = JSON.parse(existingKyc.idDocUrl)
      } catch (e) {
        console.warn('Failed to parse existing idDocUrl:', e)
      }
    }

    // Handle document updates based on the type of document being submitted
    if (data.idType === "government_id" && data.idDocUrl) {
      currentDocs.governmentId = {
        url: data.idDocUrl,
        verified: false
      }
    } else if (data.idType === "address_proof" && data.addressDocUrl) {
      currentDocs.addressProof = {
        url: data.addressDocUrl,
        verified: false
      }
    } else if (data.idType === "face_photo" && data.faceImageUrl) {
      currentDocs.faceScan = {
        url: data.faceImageUrl,
        verified: false
      }
    }

    // Log the current documents state for debugging
    console.log('Current docs before save:', currentDocs)

    // Create base data with the new document structure
    const baseData = {
      userId: session.user.id,
      verified: false,
      fullName: data.fullName || existingKyc?.fullName || '',
      address: data.address || existingKyc?.address || '',
      country: data.country || existingKyc?.country || '',
      idNumber: data.idNumber || existingKyc?.idNumber || '',
      idType: data.idType || existingKyc?.idType || '',
      idDocUrl: JSON.stringify(currentDocs) // Store the updated document structure
    }

    // Log the final data being saved
    console.log('Final KYC data being saved:', {
      ...baseData,
      documents: currentDocs
    })

    // Upsert the KYC record
    const kycResult = await prisma.kyc.upsert({
      where: { userId: session.user.id },
      update: baseData,
      create: baseData
    })

    // Update user verification status
    await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        isKycVerified: kycResult.verified,
      }
    })

    return NextResponse.json({
      success: true,
      message: 'KYC information updated successfully',
      documents: currentDocs // Return the current state of documents
    })

  } catch (error) {
    console.error('KYC update error:', error)
    return NextResponse.json(
      { error: 'Failed to update KYC information', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const kyc = await prisma.kyc.findUnique({
      where: { userId: session.user.id }
    })

    if (!kyc) {
      return NextResponse.json({ status: 'not_started' })
    }

    return NextResponse.json(kyc)

  } catch (error) {
    console.error('KYC fetch error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch KYC status' 
    }, { status: 500 })
  }
} 