import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET a single listing
export async function GET(request, { params }) {
  try {
    const { id } = await params
    console.log('id', id)
    if (!id) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 })
    }
    
    const userFields = {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      isKycVerified: true,
    }
    
    try {
      await prisma.user.findFirst({
        select: { id: true, email: true },
        take: 1
      })
      userFields.id = true
      userFields.email = true
    } catch (error) {
      console.log('Name field not available in User model')
    }
    
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        platform: true,
        category: true,
        seller: {
          select: userFields
        }
      }
    })
    
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }
    
    return NextResponse.json(listing)
  } catch (error) {
    console.error('Error fetching listing:', error)
    return NextResponse.json(
      { error: 'Failed to fetch listing' },
      { status: 500 }
    )
  }
}

// PATCH to update a listing
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { id } = params
    const body = await request.json()
    
    // Find the listing first to check ownership
    const existingListing = await prisma.listing.findUnique({
      where: { id },
      select: { sellerId: true, status: true }
    })
    
    if (!existingListing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }
    
    // Check if the user is the owner of the listing
    if (existingListing.sellerId !== session.user.id) {
      return NextResponse.json(
        { error: 'You don\'t have permission to update this listing' },
        { status: 403 }
      )
    }
    
    // Check if the listing can be edited (not sold or deleted)
    if (!['AVAILABLE', 'INACTIVE'].includes(existingListing.status)) {
      return NextResponse.json(
        { error: 'This listing cannot be edited in its current state' },
        { status: 400 }
      )
    }
    
    // Define all fields that can be updated
    const allowedFields = [
      // Account Details
      'platformId',
      'categoryId',
      'username',
      'accountCountry',
      'previewLink',
      'transferMethod',
      'verified',
      
      // Account Metrics
      'followers',
      'posts',
      'accountAge',
      'engagement',
      
      // Account Pricing
      'price',
      'negotiable',
      
      // Account Media & Description
      'mediaProof',
      'description',
      
      // Additional fields
      'credentials'
    ]
    
    // Build the update data object with only allowed fields
    const updateData = {}
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        // Handle type conversions if needed
        if (field === 'price' || field === 'engagement') {
          updateData[field] = parseFloat(body[field])
        } else if (field === 'followers' || field === 'posts' || field === 'accountAge') {
          updateData[field] = parseInt(body[field], 10)
        } else if (field === 'verified' || field === 'negotiable') {
          updateData[field] = Boolean(body[field])
        } else {
          updateData[field] = body[field]
        }
      }
    }
    
    // Update the listing
    const updatedListing = await prisma.listing.update({
      where: { id },
      data: updateData
    })
    
    return NextResponse.json(updatedListing)
  } catch (error) {
    console.error('Error updating listing:', error)
    return NextResponse.json(
      { error: 'Failed to update listing', details: error.message },
      { status: 500 }
    )
  }
} 