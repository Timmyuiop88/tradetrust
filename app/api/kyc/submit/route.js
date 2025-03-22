import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await req.json();
    const { idDocUrl, idType, idNumber } = data;
    
    // Validate required fields
    if (!idDocUrl) {
      return NextResponse.json({ error: 'Document URL is required' }, { status: 400 });
    }
    
    // Fetch current KYC record if it exists
    const existingKyc = await prisma.kyc.findUnique({
      where: { userId: session.user.id }
    });
    
    // Initialize documents object
    let documents = {};
    
    // If existing KYC record has documents, try to parse them
    if (existingKyc?.idDocUrl) {
      try {
        documents = JSON.parse(existingKyc.idDocUrl);
      } catch (error) {
        // If parsing fails but we have a URL, it might be a direct URL from before
        if (typeof existingKyc.idDocUrl === 'string' && existingKyc.idDocUrl.startsWith('http')) {
          documents = { governmentId: existingKyc.idDocUrl };
        }
      }
    }
    
    // Update documents with the new URL based on the document type
    if (idType === "government_id") {
      documents.governmentId = idDocUrl;
    } else if (idType === "address_proof") {
      documents.addressProof = idDocUrl;
    } else if (idType === "face_scan") {
      documents.faceScan = idDocUrl;
    } else {
      // Handle any other document types
      documents[idType] = idDocUrl;
    }
    
    // Store documents as JSON string
    const result = await prisma.kyc.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        idDocUrl: JSON.stringify(documents),
        idType,
        idNumber,
      },
      create: {
        userId: session.user.id,
        idDocUrl: JSON.stringify(documents),
        idType,
        idNumber,
      },
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('KYC submit error:', error);
    return NextResponse.json({ error: 'Failed to submit KYC' }, { status: 500 });
  }
} 