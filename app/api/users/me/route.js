import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function GET() {
  try {
    console.log('API: /api/users/me called')
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      console.log('API: No session or user ID')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('API: Session user ID:', session.user.id)

    // Get the user with KYC data in a single query for better performance
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        kyc: {
          select: {
            fullName: true,
            country: true,
            address: true,
            verified: true,
            idDocUrl: true,
            dob: true,
            idType: true,
            idNumber: true,
          }
        },
        listings: {
          select: {
            id: true,
            platform: true,
            price: true,
            status: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        },
        _count: {
          select: {
            listings: true,
            orders: true,
          }
        }
      }
    })

    if (!user) {
      console.log('API: User not found')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Log the KYC data to debug
    console.log('API: User KYC data:', {
      hasKyc: !!user.kyc,
      country: user.kyc?.country,
      fullName: user.kyc?.fullName,
    })

    // Format the user data for the response
    const userData = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      isEmailVerified: user.isEmailVerified,
      isKycVerified: user.isKycVerified,
      createdAt: user.createdAt ? user.createdAt.toISOString() : null,
      kyc: user.kyc ? {
        fullName: user.kyc.fullName,
        country: user.kyc.country,
        address: user.kyc.address,
        verified: user.kyc.verified,
        dob: user.kyc.dob,
      } : null,
      listings: user.listings,
      _count: user._count
    }

    // Parse the idDocUrl JSON if it exists
    if (user.kyc?.idDocUrl) {
      try {
        userData.kyc.documents = JSON.parse(user.kyc.idDocUrl)
      } catch (e) {
        console.error('API: Error parsing idDocUrl:', e)
        userData.kyc.documents = {}
      }
    }

    console.log('API: User data being returned:', {
      id: userData.id,
      email: userData.email,
      createdAt: userData.createdAt,
      hasKyc: !!userData.kyc,
      country: userData.kyc?.country
    })

    return NextResponse.json(userData)
  } catch (error) {
    console.error('API: User profile error:', error)
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 })
  }
}

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    
    // Extract the fields we want to update
    const { firstName, lastName } = data
    
    // Prepare update object
    const updateData = {}
    
    // Handle updating the user's name fields
    if (firstName) updateData.firstName = firstName.trim()
    if (lastName) updateData.lastName = lastName.trim()
    
    // Only proceed if we have data to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }
    
    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
      }
    })
    
    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser
    })
  } catch (error) {
    console.error('API: Update user profile error:', error)
    return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 })
  }
} 