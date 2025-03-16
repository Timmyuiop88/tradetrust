import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { generateVerificationToken } from '@/lib/tokens'
import { sendVerificationEmail } from '@/lib/email/emailService'

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName } = body
    
    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }
    
    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase();
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        firstName,
        lastName,
        Balance: {
          create: {
            buyingBalance: 0,
            sellingBalance: 0
          }
        }
      }
    })
    
    // Generate verification token and send verification email
    try {
      const verificationToken = await generateVerificationToken(normalizedEmail);
      await sendVerificationEmail({
        email: normalizedEmail,
        firstName: firstName || 'User',
      }, verificationToken.token);
    } catch (error) {
      console.error('Error sending verification email:', error);
      // Continue with signup process even if email fails
    }
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user
    
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('Error during signup:', error)
    return NextResponse.json(
      { error: 'An error occurred during signup' },
      { status: 500 }
    )
  }
} 