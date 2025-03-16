import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateVerificationToken } from '@/lib/tokens';
import { sendVerificationEmail } from '@/lib/email/emailService';

export async function POST(req) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase();
    
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });
    
    if (!user) {
      // For security reasons, don't reveal that the user doesn't exist
      return NextResponse.json(
        { success: true },
        { status: 200 }
      );
    }
    
    // If the user is already verified, no need to send another email
    if (user.isEmailVerified) {
      return NextResponse.json(
        { 
          success: true,
          message: 'Your email is already verified. You can now log in to your account.' 
        },
        { status: 200 }
      );
    }
    
    // Check if there's an existing token that's not expired
    const existingToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: normalizedEmail,
        type: 'email',
        expires: {
          gt: new Date()
        }
      }
    });
    
    // If there's a token that's not expired and was created less than 5 minutes ago, prevent spam
    if (existingToken) {
      const tokenCreatedAt = new Date(existingToken.createdAt);
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      if (tokenCreatedAt > fiveMinutesAgo) {
        return NextResponse.json(
          { error: 'Please wait before requesting another verification email' },
          { status: 429 }
        );
      }
      
      // Delete the existing token if it's older than 5 minutes
      await prisma.verificationToken.delete({
        where: { 
          identifier_type: {
            identifier: normalizedEmail,
            type: 'email'
          }
        }
      });
    }
    
    // Generate a new verification token
    const verificationToken = await generateVerificationToken(normalizedEmail);
    
    // Send the verification email
    await sendVerificationEmail(
      {
        email: normalizedEmail,
        firstName: user.firstName || 'User'
      },
      verificationToken.token
    );
    
    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error resending verification email:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
} 