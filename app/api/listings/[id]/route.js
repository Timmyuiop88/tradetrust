import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
     
      createdAt: true
    }
    
    try {
      await prisma.user.findFirst({
        select: { name: true },
        take: 1
      })
      userFields.name = true
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