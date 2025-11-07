/**
 * Crypto Utilities (DRY)
 * Common cryptographic operations
 */
import crypto from 'crypto';
import bcrypt from 'bcrypt';

/**
 * Hash password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

/**
 * Verify password against hash
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * Generate secure random token
 */
export const generateToken = (length = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate UUID v4
 */
export const generateUUID = (): string => {
  return crypto.randomUUID();
};

/**
 * Hash data using SHA-256
 */
export const hashData = (data: string): string => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Create HMAC signature
 */
export const createHMAC = (data: string, secret: string): string => {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
};

/**
 * Generate secure random number
 */
export const generateRandomNumber = (min: number, max: number): number => {
  const range = max - min;
  const randomBytes = crypto.randomBytes(4);
  const randomNumber = randomBytes.readUInt32BE(0) / 0xFFFFFFFF;
  return Math.floor(randomNumber * range) + min;
};

/**
 * Encrypt data using AES-256-GCM
 */
export const encrypt = (text: string, key: string): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return iv.toString('hex') + ':' + encrypted + ':' + authTag.toString('hex');
};

/**
 * Decrypt data using AES-256-GCM
 */
export const decrypt = (encryptedText: string, key: string): string => {
  const parts = encryptedText.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const authTag = Buffer.from(parts[2], 'hex');

  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(key), iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};
