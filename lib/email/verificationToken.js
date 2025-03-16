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
 * Create a verification token for a user
 * @param {string} userId - User ID
 * @param {string} type - Token type (email, password)
 * @returns {Promise<string>} - Generated token
 */
export const createVerificationToken = async (userId, type = 'email') => {
  const token = generateToken();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  // Create or update token in database
  await prisma.verificationToken.upsert({
    where: {
      identifier_type: {
        identifier: userId,
        type,
      },
    },
    update: {
      token,
      expires,
    },
    create: {
      identifier: userId,
      token,
      expires,
      type,
    },
  });
  
  return token;
};

/**
 * Create a password reset token for a user
 * @param {string} userId - User ID
 * @returns {Promise<string>} - Generated token
 */
export const createPasswordResetToken = async (userId) => {
  const token = generateToken();
  const expires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
  
  // Create or update token in database
  await prisma.verificationToken.upsert({
    where: {
      identifier_type: {
        identifier: userId,
        type: 'password',
      },
    },
    update: {
      token,
      expires,
    },
    create: {
      identifier: userId,
      token,
      expires,
      type: 'password',
    },
  });
  
  return token;
};

/**
 * Verify a token
 * @param {string} token - Token to verify
 * @param {string} type - Token type (email, password)
 * @returns {Promise<string|null>} - User ID if token is valid, null otherwise
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

/**
 * Delete a token
 * @param {string} token - Token to delete
 * @param {string} type - Token type (email, password)
 * @returns {Promise<void>}
 */
export const deleteToken = async (token, type = 'email') => {
  await prisma.verificationToken.deleteMany({
    where: {
      token,
      type,
    },
  });
}; 