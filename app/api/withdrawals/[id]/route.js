import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendWithdrawalConfirmation } from '@/lib/services/notificationService';
import { sendNotificationEmail } from '@/lib/email/emailService';

// GET - Fetch a specific withdrawal request
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const withdrawalId = params.id;
    
    if (!withdrawalId) {
      return NextResponse.json({ error: 'Withdrawal ID is required' }, { status: 400 });
    }
    
    const withdrawal = await prisma.withdrawalRequest.findUnique({
      where: { id: withdrawalId },
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
        transactions: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
    
    if (!withdrawal) {
      return NextResponse.json({ error: 'Withdrawal request not found' }, { status: 404 });
    }
    
    // Check if user is authorized to view this withdrawal
    const isOwner = withdrawal.userId === session.user.id;
    const isAdmin = ['ADMIN', 'MODERATOR', 'SUPER_ADMIN'].includes(session.user.role);
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'You do not have permission to view this withdrawal request' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(withdrawal);
  } catch (error) {
    console.error('Error fetching withdrawal request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch withdrawal request: ' + error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update a withdrawal request (for admins/moderators)
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only admins, moderators, and super admins can update withdrawal requests
    if (!['ADMIN', 'MODERATOR', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    
    const withdrawalId = params.id;
    
    if (!withdrawalId) {
      return NextResponse.json({ error: 'Withdrawal ID is required' }, { status: 400 });
    }
    
    const data = await request.json();
    const { status, notes, trackingInfo } = data;
    
    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }
    
    // Get the current withdrawal request
    const currentWithdrawal = await prisma.withdrawalRequest.findUnique({
      where: { id: withdrawalId },
      include: {
        transactions: {
          where: {
            type: 'WITHDRAWAL',
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
          },
        },
      },
    });
    
    if (!currentWithdrawal) {
      return NextResponse.json({ error: 'Withdrawal request not found' }, { status: 404 });
    }
    
    // Update the withdrawal request
    const updatedWithdrawal = await prisma.$transaction(async (prisma) => {
      // Update the withdrawal request
      const withdrawal = await prisma.withdrawalRequest.update({
        where: { id: withdrawalId },
        data: {
          status,
          notes: notes || currentWithdrawal.notes,
          trackingInfo: trackingInfo || currentWithdrawal.trackingInfo,
          processedById: session.user.id,
          completedAt: status === 'COMPLETED' ? new Date() : currentWithdrawal.completedAt,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
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
      });
      
      // Update the associated transaction status
      let updatedTransaction = null;
      if (currentWithdrawal.transactions.length > 0) {
        const transactionStatus = 
          status === 'COMPLETED' ? 'COMPLETED' :
          status === 'REJECTED' || status === 'CANCELLED' ? 'CANCELLED' :
          'PENDING';
        
        updatedTransaction = await prisma.transaction.update({
          where: { id: currentWithdrawal.transactions[0].id },
          data: { status: transactionStatus },
        });
        
        // If rejected or cancelled, refund the user's balance
        if (status === 'REJECTED' || status === 'CANCELLED') {
          await prisma.balance.updateMany({
            where: { userId: currentWithdrawal.userId },
            data: { sellingBalance: { increment: currentWithdrawal.amount } },
          });
          
          // Create a refund transaction
          await prisma.transaction.create({
            data: {
              userId: currentWithdrawal.userId,
              type: 'REFUND',
              amount: currentWithdrawal.amount,
              status: 'COMPLETED',
              description: `Refund for cancelled/rejected withdrawal request #${currentWithdrawal.id}`,
              withdrawalRequestId: currentWithdrawal.id,
            },
          });
        }
      }
      
      return { withdrawal, updatedTransaction };
    });
    
    // Send email notification based on status change
    try {
      const user = currentWithdrawal.user;
      
      if (status === 'COMPLETED') {
        // Send withdrawal completion email
        const estimatedArrival = trackingInfo || '1-2 business days';
        await sendWithdrawalConfirmation(
          user.id, 
          updatedWithdrawal.updatedTransaction.id, 
          estimatedArrival
        );
      } else if (status === 'REJECTED' || status === 'CANCELLED') {
        // Send cancellation notification
        await sendNotificationEmail(user, {
          subject: `Withdrawal Request ${status === 'REJECTED' ? 'Rejected' : 'Cancelled'}`,
          message: `Your withdrawal request for $${currentWithdrawal.amount.toFixed(2)} has been ${status.toLowerCase()}. ${notes || ''}`,
          actionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/transactions`,
          actionText: 'View Details'
        });
      } else {
        // Send status update notification
        await sendNotificationEmail(user, {
          subject: 'Withdrawal Request Update',
          message: `Your withdrawal request for $${currentWithdrawal.amount.toFixed(2)} has been updated to ${status.toLowerCase()}. ${notes || ''}`,
          actionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/transactions`,
          actionText: 'View Details'
        });
      }
      
      console.log(`Withdrawal ${status.toLowerCase()} email sent successfully`);
    } catch (emailError) {
      console.error('Error sending withdrawal status email:', emailError);
      // Don't fail the request if email sending fails
    }
    
    return NextResponse.json(updatedWithdrawal.withdrawal);
  } catch (error) {
    console.error('Error updating withdrawal request:', error);
    return NextResponse.json(
      { error: 'Failed to update withdrawal request: ' + error.message },
      { status: 500 }
    );
  }
} 