import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generatePasswordResetToken } from '@/lib/tokens';
import { sendPasswordResetEmail } from '@/lib/email/emailService';

export async function POST(request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase();
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    
    // Don't reveal if user exists or not for security reasons
    if (!user) {
      return NextResponse.json(
        { success: true, message: 'If an account with that email exists, a password reset link has been sent' }
      );
    }
    
    // Generate reset token and send email
    const resetToken = await generatePasswordResetToken(normalizedEmail);
    await sendPasswordResetEmail({
      email: normalizedEmail,
      firstName: user.firstName || 'User'
    }, resetToken.token);
    
    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent',
    });
  } catch (error) {
    console.error('Error in forgot password:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}; 