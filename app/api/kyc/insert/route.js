import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    console.log('KYC data received:', data) // Debug log
    
    const existingKyc = await prisma.kyc.findUnique({
      where: { userId: session.user.id }
    })

    if (existingKyc?.verified) {
      return NextResponse.json({ error: 'KYC already verified' }, { status: 400 })
    }

    // Handle document URLs as JSON
    if (data.governmentIdUrl || data.faceImageUrl || data.addressDocUrl) {
      const currentDocs = existingKyc?.idDocUrl ? JSON.parse(existingKyc.idDocUrl) : {}
      const updatedDocs = {
        ...currentDocs,
        ...(data.governmentIdUrl && { governmentId: data.governmentIdUrl }),
        ...(data.faceImageUrl && { faceScan: data.faceImageUrl }),
        ...(data.addressDocUrl && { addressProof: data.addressDocUrl })
      }
      data.idDocUrl = JSON.stringify(updatedDocs)
    }

    // Create a clean data object with only valid schema fields
    const cleanData = {
      idType: data.idType || existingKyc?.idType || "government_id",
      idNumber: data.idNumber || existingKyc?.idNumber || "12345",
      fullName: data.fullName || existingKyc?.fullName || "User",
      idDocUrl: data.idDocUrl,
      address: data.address,
      country: data.country,
      dob: data.dob,
      verified: false,
      updatedAt: new Date()
    }

    // For updates, we don't need to validate all fields
    let kyc
    if (existingKyc) {
      // For updates, just update the fields that are provided
      kyc = await prisma.kyc.update({
        where: { userId: session.user.id },
        data: cleanData
      })
    } else {
      // For new records, we need at least some basic info
      kyc = await prisma.kyc.create({
        data: {
          userId: session.user.id,
          ...cleanData
        }
      })
    }

    return NextResponse.json({
      message: 'KYC information updated successfully',
      kyc
    })

  } catch (error) {
    console.error('KYC submission error:', error)
    return NextResponse.json({ 
      error: 'Failed to process KYC submission', 
      details: error.message 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
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