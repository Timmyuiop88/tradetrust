import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { kyc: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const steps = [
      {
        id: 1,
        type: "identity",
        title: "Identity Verification",
        description: "Upload a valid government ID",
        status: user.kyc?.idDocUrl ? "completed" : "pending"
      },
      {
        id: 2,
        type: "address",
        title: "Address Verification",
        description: "Proof of address document",
        status: user.kyc?.address ? "completed" : 
                user.kyc?.idDocUrl ? "pending" : "locked"
      },
      {
        id: 3,
        type: "face",
        title: "Face Verification",
        description: "Quick selfie verification",
        status: user.kyc?.verified ? "completed" : 
                user.kyc?.address ? "pending" : "locked"
      }
    ]

    return NextResponse.json({ steps })
  } catch (error) {
    console.error('KYC status error:', error)
    return NextResponse.json({ error: 'Failed to fetch KYC status' }, { status: 500 })
  }
} 