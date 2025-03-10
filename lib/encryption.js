import crypto from 'crypto'

// Use environment variables for the encryption key
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-encryption-key-here'

// Encrypt data
export function encrypt(text) {
  if (!text) return null
  
  // Generate a random IV for each encryption
  const iv = crypto.randomBytes(16)
  const key = Buffer.from(ENCRYPTION_KEY, 'utf8').slice(0, 32) // Ensure key is 32 bytes
  
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  // Return both the IV and encrypted data
  return iv.toString('hex') + ':' + encrypted
}

// Decrypt data
export function decrypt(encryptedData) {
  if (!encryptedData) return null
  
  // Split the IV and encrypted data
  const [ivHex, encrypted] = encryptedData.split(':')
  
  if (!ivHex || !encrypted) return null
  
  const iv = Buffer.from(ivHex, 'hex')
  const key = Buffer.from(ENCRYPTION_KEY, 'utf8').slice(0, 32) // Ensure key is 32 bytes
  
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
} 