import { randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
	const salt = randomBytes(16).toString('hex');
	const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
	return `${salt}:${derivedKey.toString('hex')}`;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	const { timingSafeEqual } = await import('crypto');
	const [salt, storedKey] = hash.split(':');
	const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
	const storedKeyBuffer = Buffer.from(storedKey, 'hex');
	return timingSafeEqual(derivedKey, storedKeyBuffer);
}
