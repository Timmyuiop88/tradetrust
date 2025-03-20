import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendWithdrawalConfirmation } from '@/lib/services/notificationService';

// GET - Fetch all withdrawal requests for the current user
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    let whereClause = {};
    
    // For regular users, only show their own withdrawal requests
    if (session.user.role === 'USER') {
      whereClause.userId = session.user.id;
    } 
    // For admins, moderators, and super admins, they can see all requests or filter
    else if (['ADMIN', 'MODERATOR', 'SUPER_ADMIN'].includes(session.user.role)) {
      // If they're looking for a specific user's withdrawals
      const userId = searchParams.get('userId');
      if (userId) {
        whereClause.userId = userId;
      }
    } else {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    
    // Filter by status if provided
    if (status) {
      whereClause.status = status;
    }
    
    const withdrawalRequests = await prisma.withdrawalRequest.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        payoutSetting: true,
        processedBy: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        transactions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json({ withdrawalRequests });
  } catch (error) {
    console.error('Error fetching withdrawal requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch withdrawal requests: ' + error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new withdrawal request
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await request.json();
    const { amount, payoutSettingId } = data;
    
    if (!amount || !payoutSettingId) {
      return NextResponse.json(
        { error: 'Amount and payout setting are required' },
        { status: 400 }
      );
    }
    
    // Verify the payout setting belongs to the user
    const payoutSetting = await prisma.payoutSettings.findUnique({
      where: {
        id: payoutSettingId,
        userId: session.user.id,
      },
    });
    
    if (!payoutSetting) {
      return NextResponse.json(
        { error: 'Invalid payout setting' },
        { status: 400 }
      );
    }
    
    // Check if user has sufficient balance
    const userBalance = await prisma.balance.findFirst({
      where: { userId: session.user.id },
    });
    
    if (!userBalance || userBalance.sellingBalance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }
    
    // Calculate fee (example: 2% fee)
    const fee = amount * 0.02;
    const netAmount = amount - fee;
    
    // Create withdrawal request in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create the withdrawal request
      const withdrawalRequest = await prisma.withdrawalRequest.create({
        data: {
          userId: session.user.id,
          amount,
          fee,
          netAmount,
          payoutSettingId,
          status: 'PROCESSING',
        },
      });
      
      // Create a transaction record
      const transaction = await prisma.transaction.create({
        data: {
          userId: session.user.id,
          type: 'WITHDRAWAL',
          amount: -amount, // Negative amount for withdrawal
          fee,
          status: 'PENDING',
          description: `Withdrawal request via ${payoutSetting.method || 'bank transfer'}`,
          withdrawalRequestId: withdrawalRequest.id,
        },
      });
      
      // Update user balance
      await prisma.balance.update({
        where: { id: userBalance.id },
        data: { 
          sellingBalance: { 
            decrement: amount 
          }
        },
      });
      
      return { withdrawalRequest, transaction };
    });
    
    // Send withdrawal confirmation email
    try {
      // Get user details for the email
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, email: true, firstName: true }
      });
      
      // Estimate arrival time (e.g., 3-5 business days)
      const estimatedArrival = '3-5 business days';
      
      await sendWithdrawalConfirmation(
        session.user.id, 
        result.transaction.id, 
        estimatedArrival
      );
      
      console.log('Withdrawal confirmation email sent successfully');
    } catch (emailError) {
      console.error('Error sending withdrawal confirmation email:', emailError);
      // Don't fail the request if email sending fails
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating withdrawal request:', error);
    return NextResponse.json(
      { error: 'Failed to create withdrawal request: ' + error.message },
      { status: 500 }
    );
  }
} 