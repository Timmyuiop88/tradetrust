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
      select: { sellerId: true }
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
    
    // Only allow specific fields to be updated
    const allowedFields = ['price', 'description', 'negotiable']
    const updateData = {}
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
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
      { error: 'Failed to update listing' },
      { status: 500 }
    )
  }
} 