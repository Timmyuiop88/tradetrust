import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { recipientId, content, isDisputeMessage = false, disputeId = null, orderId, isModOnly = false } = body;

        if (!recipientId || !content) {
            return NextResponse.json({ error: 'Recipient ID and content are required' }, { status: 400 });
        }

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required for sending messages' }, { status: 400 });
        }

        // Check if the recipient exists
        const recipient = await prisma.user.findUnique({
            where: { id: recipientId }
        });
        
        if (!recipient) {
            return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
        }

        // Verify the order exists
        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Create the message
        const message = await prisma.chatMessage.create({
            data: {
                sender: {
                    connect: { id: session.user.id }
                },
                recipient: {
                    connect: { id: recipientId }
                },
                content,
                isModOnly,
                order: {
                    connect: { id: orderId }
                },
                ...(disputeId && {
                    dispute: {
                        connect: { id: disputeId }
                    }
                })
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        email: true
                    }
                }
            }
        });
        
        return NextResponse.json({ message });
    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json({ error: error.message || 'Failed to send message' }, { status: 500 });
    }
} 