import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const platforms = await prisma.platform.findMany({
      orderBy: {
        name: 'asc'
      }
    })
    
    return NextResponse.json(platforms)
  } catch (error) {
    console.error('Error fetching platforms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch platforms' }, 
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const platform = await prisma.platform.create({
      data: {
        name: data.name,
        icon: data.icon
      }
    })
    return NextResponse.json(platform)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create platform' }, { status: 500 })
  }
} 