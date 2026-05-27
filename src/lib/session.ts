import crypto from 'crypto';
import { cookies } from 'next/headers';
import dbConnect from '@/database/mongodb';
import User from '@/database/models/User';

// SESSION_SECRET must be set in .env — no fallback allowed for security in production
function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    // Avoid crashing during Next.js build phase on Vercel when env vars aren't injected
    if (process.env.NEXT_PHASE?.includes('build') || process.env.NEXT_PHASE?.includes('export')) {
      return 'dummy-secret-for-build-purposes-only';
    }
    throw new Error(
      'SECURITY ERROR: SESSION_SECRET environment variable is not set. ' +
      'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"'
    );
  }
  return secret;
}

const PBKDF2_ITERATIONS = 210_000; // OWASP recommended minimum for SHA-512 (2024)
const IV_LENGTH = 12; // Standard IV length for AES-GCM

// PBKDF2 Password Hashing — stores iterations in hash string for forward compatibility
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, 64, 'sha512').toString('hex');
  // Format: salt:iterations:hash (iterations stored for backward compat during upgrades)
  return `${salt}:${PBKDF2_ITERATIONS}:${hash}`;
}

export function verifyPassword(password: string, storedValue: string): boolean {
  try {
    const parts = storedValue.split(':');
    if (parts.length === 3) {
      // New format: salt:iterations:hash
      const [salt, iterStr, originalHash] = parts;
      if (!salt || !iterStr || !originalHash) return false;
      const iterations = parseInt(iterStr, 10);
      const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
      return hash === originalHash;
    } else if (parts.length === 2) {
      // Legacy format: salt:hash (1000 iterations)
      const [salt, originalHash] = parts;
      if (!salt || !originalHash) return false;
      const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
      return hash === originalHash;
    }
    return false;
  } catch {
    return false;
  }
}

// AES-256-GCM Session Encryption
export function encrypt(text: string): string {
  const key = crypto.scryptSync(getSessionSecret(), 'salt', 32);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(cipherText: string): string {
  try {
    const key = crypto.scryptSync(getSessionSecret(), 'salt', 32);
    const [ivHex, authTagHex, encryptedText] = cipherText.split(':');
    if (!ivHex || !authTagHex || !encryptedText) return '';
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error("Session decryption failed:", error);
    return '';
  }
}

// Session management
export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const token = encrypt(JSON.stringify({ userId, exp: expiresAt.getTime() }));
  
  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

export async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return null;
    
    const decrypted = decrypt(token);
    if (!decrypted) return null;
    
    const payload = JSON.parse(decrypted);
    if (!payload.userId || !payload.exp || payload.exp < Date.now()) {
      return null;
    }
    
    await dbConnect();
    const user = await User.findById(payload.userId).lean();
    if (!user) return null;
    
    return JSON.parse(JSON.stringify({
      ...user,
      id: user._id.toString(),
      _id: user._id.toString(),
    }));
  } catch (error) {
    console.error("Failed to get session user:", error);
    return null;
  }
}
