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
    console.log('KYC data received:', data) // Debug log
    
    const existingKyc = await prisma.kyc.findUnique({
      where: { userId: session.user.id }
    })

    // Get user info for required fields if not provided
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { firstName: true, lastName: true }
    })

    if (existingKyc?.verified) {
      return NextResponse.json({ error: 'KYC already verified' }, { status: 400 })
    }

    // Handle document URLs as JSON
    if (data.governmentIdUrl || data.faceImageUrl || data.addressDocUrl) {
      // Safely parse existing idDocUrl
      let currentDocs = {}
      
      if (existingKyc?.idDocUrl) {
        try {
          // Check if the string is already a URL (not JSON)
          if (typeof existingKyc.idDocUrl === 'string' && 
              (existingKyc.idDocUrl.startsWith('http') || !existingKyc.idDocUrl.startsWith('{'))) {
            // Legacy format - single URL string
            currentDocs = { governmentId: existingKyc.idDocUrl }
          } else {
            // Try to parse as JSON
            currentDocs = JSON.parse(existingKyc.idDocUrl)
          }
        } catch (e) {
          console.warn('Failed to parse idDocUrl as JSON, treating as string URL:', e)
          // If parsing fails, assume it's a direct URL string
          currentDocs = { governmentId: existingKyc.idDocUrl }
        }
      }

      const updatedDocs = {
        ...currentDocs,
        ...(data.governmentIdUrl && { governmentId: data.governmentIdUrl }),
        ...(data.faceImageUrl && { faceScan: data.faceImageUrl }),
        ...(data.addressDocUrl && { addressProof: data.addressDocUrl })
      }

      // Store as JSON string
      data.idDocUrl = JSON.stringify(updatedDocs)
      
      // Log the updated documents object for debugging
      console.log('Updated document URLs:', updatedDocs)
    }

    // Check if we have a valid fullName from the request
    const fullName = data.fullName?.trim() || null;
    
    // Construct user's full name from first and last name if available
    const userFullName = user?.firstName && user?.lastName 
      ? `${user.firstName} ${user.lastName}`.trim() 
      : null;
    
    // Get a valid fullName from existing sources if not provided
    const validFullName = fullName || 
                          existingKyc?.fullName || 
                          userFullName ||
                          'Unknown';

    // Create base data with only fields that exist in the KYC model
    const baseData = {
      userId: session.user.id,
      verified: false, // Always set to false on update, admin must verify
      // Include required fields with defaults if not provided
      fullName: validFullName,
      address: data.address || existingKyc?.address || '',
      country: data.country || existingKyc?.country || '',
      idNumber: data.idNumber || existingKyc?.idNumber || '',
      idType: data.idType || existingKyc?.idType || '',
      idDocUrl: data.idDocUrl || existingKyc?.idDocUrl || ''
    }

    // Allow only fields that exist in the Prisma KYC model
    // Remove fields that are not in the model
    delete data.email; // Email is not in the KYC model
    delete data.governmentIdUrl;
    delete data.faceImageUrl;
    delete data.addressDocUrl;

    // Create the final upsert data
    const upsertData = {
      ...baseData
    }

    // Log the data being used for upsert (for debugging)
    console.log('Upserting KYC with data:', {
      userId: upsertData.userId,
      hasIdDocUrl: !!upsertData.idDocUrl,
      fullName: upsertData.fullName,
      // Other fields could be logged here
    })

    // Upsert the KYC record
    const kycResult = await prisma.kyc.upsert({
      where: { userId: session.user.id },
      update: upsertData,
      create: upsertData
    })

    // Check if we need to update the user's name in the User model to keep it in sync
    if (fullName && fullName !== userFullName) {
      try {
        // Parse the fullName into firstName and lastName
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(' ') || "";
        
        // Update the user record if the name has changed
        await prisma.user.update({
          where: { id: session.user.id },
          data: { 
            firstName: firstName,
            lastName: lastName,
            isKycVerified: kycResult.verified,
          }
        })
        
        console.log('Updated user firstName and lastName to match KYC fullName:', fullName);
      } catch (error) {
        console.error('Error updating user name:', error);
        // Continue with the KYC update even if user name update fails
      }
    } else {
      // Just update the KYC verification status if needed
      await prisma.user.update({
        where: { id: session.user.id },
        data: { 
          isKycVerified: kycResult.verified,
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'KYC information updated successfully'
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