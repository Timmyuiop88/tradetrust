import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { verifyToken } from '@/lib/tokens';
import { sendNotificationEmail } from '@/lib/email/emailService';

export async function POST(request) {
  try {
    const { token, password } = await request.json();
    
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }
    
    // Verify token
    const email = await verifyToken(token, 'password');
    
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
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
    
    // Delete token
    await prisma.verificationToken.delete({
      where: {
        identifier_type: {
          identifier: email,
          type: 'password',
        },
      },
    });
    
    // Send notification email
    try {
      await sendNotificationEmail({
        email,
        firstName: user.firstName || 'User'
      }, {
        subject: 'Your Password Has Been Reset',
        message: 'Your password has been successfully reset. If you did not request this change, please contact our support team immediately.',
        actionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
        actionText: 'Login Now',
      });
    } catch (error) {
      console.error('Error sending password reset notification:', error);
      // Continue with password reset process even if email fails
    }
    
    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { error: 'An error occurred while resetting your password' },
      { status: 500 }
    );
  }
}; 