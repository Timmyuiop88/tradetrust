import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/tokens';
import { sendWelcomeEmail } from '@/lib/email/emailService';

export async function GET(request) {
  try {
    // Get token from URL
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }
    
    // Verify token
    const email = await verifyToken(token, 'email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true },
    });
    
    // Delete token
    await prisma.verificationToken.delete({
      where: {
        identifier_type: {
          identifier: email,
          type: 'email',
        },
      },
    });
    
    // Send welcome email
    try {
      await sendWelcomeEmail({
        email: user.email,
        firstName: user.firstName || 'User',
      });
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Continue with verification process even if email fails
    }
    
    // Redirect to login page with success message
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?verified=true`
    );
  } catch (error) {
    console.error('Error verifying email:', error);
    return NextResponse.json(
      { error: 'An error occurred while verifying email' },
      { status: 500 }
    );
  }
}; 