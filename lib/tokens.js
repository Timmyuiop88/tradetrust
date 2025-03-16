import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

/**
 * Generate a random token
 * @returns {string} - Random token
 */
export const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Generate a verification token for an email
 * @param {string} email - User's email
 * @returns {Promise<Object>} - Generated token object
 */
export const generateVerificationToken = async (email) => {
  const token = generateToken();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  // Delete any existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: {
      identifier: email,
      type: 'email',
    },
  });
  
  // Create a new token
  const verificationToken = await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
      type: 'email',
    },
  });
  
  return verificationToken;
};

/**
 * Generate a password reset token for an email
 * @param {string} email - User's email
 * @returns {Promise<Object>} - Generated token object
 */
export const generatePasswordResetToken = async (email) => {
  const token = generateToken();
  const expires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
  
  // Delete any existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: {
      identifier: email,
      type: 'password',
    },
  });
  
  // Create a new token
  const resetToken = await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
      type: 'password',
    },
  });
  
  return resetToken;
};

/**
 * Verify a token
 * @param {string} token - Token to verify
 * @param {string} type - Token type (email, password)
 * @returns {Promise<string|null>} - Email if token is valid, null otherwise
 */
export const verifyToken = async (token, type = 'email') => {
  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      token,
      type,
      expires: {
        gt: new Date(),
      },
    },
  });
  
  if (!verificationToken) {
    return null;
  }
  
  return verificationToken.identifier;
}; 