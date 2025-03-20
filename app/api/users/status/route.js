import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/app/lib/prisma';

export async function POST(request) {
    try {
        // Get the current user from the session
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }
        
        // Update the user's updatedAt timestamp (instead of lastSeen which doesn't exist)
        await prisma.user.update({
            where: {
                id: session.user.id,
            },
            data: {
                updatedAt: new Date(),
            },
        });
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating user status:', error);
        return NextResponse.json(
            { error: 'Failed to update status: ' + error.message },
            { status: 500 }
        );
    }
} 