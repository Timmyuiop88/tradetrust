import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payoutSettings = await prisma.payoutSettings.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(payoutSettings)
  } catch (error) {
    console.error('Payout settings error:', error)
    return NextResponse.json({ error: 'Failed to fetch payout settings' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    // Handle deletion
    if (data.id && data.delete) {
      await prisma.payoutSettings.delete({
        where: { 
          id: data.id,
          userId: session.user.id // Ensure user owns this record
        }
      })
      
      return NextResponse.json({ success: true })
    }
    
    // Validate required fields
    if (!data.method || !data.details) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // If setting as default, unset any existing defaults
    if (data.isDefault) {
      await prisma.payoutSettings.updateMany({
        where: { 
          userId: session.user.id,
          isDefault: true
        },
        data: { isDefault: false }
      })
    }
    
    // Update or create
    if (data.id) {
      // Update existing
      const updated = await prisma.payoutSettings.update({
        where: { 
          id: data.id,
          userId: session.user.id // Ensure user owns this record
        },
        data: {
          method: data.method,
          details: data.details,
          isDefault: data.isDefault || false,
          isVerified: data.isVerified || false,
          updatedAt: new Date()
        }
      })
      
      return NextResponse.json(updated)
    } else {
      // Create new
      const created = await prisma.payoutSettings.create({
        data: {
          userId: session.user.id,
          method: data.method,
          details: data.details,
          isDefault: data.isDefault || false,
          isVerified: false // New settings start unverified
        }
      })
      
      return NextResponse.json(created)
    }
  } catch (error) {
    console.error('Payout settings update error:', error)
    return NextResponse.json({ error: 'Failed to update payout settings' }, { status: 500 })
  }
} 