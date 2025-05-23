import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '../../auth/[...nextauth]/route';

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

    // Safely parse the document URLs if they exist
    let docs = {};
    if (user.kyc?.idDocUrl) {
      try {
        // Check if the string starts with http/https (a URL) or isn't a valid JSON
        if (typeof user.kyc.idDocUrl === 'string' && 
            (user.kyc.idDocUrl.startsWith('http') || !user.kyc.idDocUrl.startsWith('{'))) {
          // It's a single URL, not JSON
          docs.governmentId = user.kyc.idDocUrl;
        } else {
          // Try to parse as JSON
          docs = JSON.parse(user.kyc.idDocUrl);
        }
      } catch (error) {
        console.error('Error parsing idDocUrl:', error);
        // If parsing fails, assume it's a direct URL
        docs.governmentId = user.kyc.idDocUrl;
      }
    }

    // Check if address is stored
    const hasAddressInfo = user.kyc?.address && user.kyc?.country;

    // Define the steps with their statuses
    const steps = [
      {
        id: 1,
        type: "identity",
        title: "Identity Verification",
        description: "Upload a valid government ID",
        status: docs.governmentId ? (user.kyc?.verified ? "completed" : "pending_review") : "pending"
      },
      {
        id: 2,
        type: "address",
        title: "Address Verification",
        description: "Proof of address document",
        status: docs.addressProof ? (user.kyc?.verified ? "completed" : "pending_review") : 
                hasAddressInfo ? "pending_review" :
                docs.governmentId ? "pending" : "locked"
      },
      {
        id: 3,
        type: "face",
        title: "Face Verification",
        description: "Quick selfie verification",
        status: docs.faceScan ? (user.kyc?.verified ? "completed" : "pending_review") : 
                (docs.addressProof || hasAddressInfo) ? "pending" : "locked"
      }
    ]

    return NextResponse.json({
      steps,
      isKycVerified: user.isKycVerified,
      isEmailVerified: user.isEmailVerified,
      kycStatus: user.kyc?.verified ? "approved" : 
                 docs.faceScan ? "pending_review" : "incomplete"
    })
  } catch (error) {
    console.error('KYC status error:', error)
    return NextResponse.json({ error: 'Failed to fetch KYC status' }, { status: 500 })
  }
} 