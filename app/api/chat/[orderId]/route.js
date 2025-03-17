import { NextResponse } from 'next/server';

/**
 * GET /api/chat/[orderId]
 * Fetches messages for a specific order
 */
export async function GET(request, { params }) {
  // Return a simple response with the orderId
  return NextResponse.json({ 
    success: true,
    orderId: params.orderId
  });
} 