import crypto from 'crypto'

// Use environment variables for the encryption key
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY // Must be 32 bytes (256 bits)
const IV_LENGTH = 16 // For AES, this is always 16

// Encrypt data
export function encrypt(text) {
  if (!text) return null
  
  // Generate a random IV for each encryption
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv)
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  
  // Return both the IV and encrypted data
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`
}

// Decrypt data
export function decrypt(text) {
  if (!text) return null
  
  const parts = text.split(':')
  const iv = Buffer.from(parts[0], 'hex')
  const encryptedText = Buffer.from(parts[1], 'hex')
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv)
  let decrypted = decipher.update(encryptedText)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  
  return decrypted.toString()
} 