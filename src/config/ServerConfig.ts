import { resolve } from 'node:path';

export type StorageDriver = 'local' | 'r2';

export type R2Config = { accountId: string; accessKeyId: string; secretAccessKey: string; bucket: string };

/** Every environment variable the server reads, in one place; see .env.example. */
export default class ServerConfig {
	public static isProduction() {
		return process.env.NODE_ENV === 'production';
	}

	public static getJwtSecret() {
		return ServerConfig.required('JWT_SECRET');
	}

	/** Where links in emails point. */
	public static getAppUrl() {
		return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
	}

	public static getResendApiKey() {
		return process.env.RESEND_API_KEY || undefined;
	}

	/** Set in development to send every email to one inbox. */
	public static getResendTestEmail() {
		// .env.example leaves it as "", which must mean unset.
		return process.env.RESEND_TEST_EMAIL || undefined;
	}

	public static getStorageDriver(): StorageDriver {
		return process.env.STORAGE_DRIVER === 'r2' ? 'r2' : 'local';
	}

	public static getUploadDir() {
		return resolve(process.cwd(), process.env.UPLOAD_DIR ?? './uploads');
	}

	public static getR2Config(): R2Config {
		return {
			accountId: ServerConfig.required('R2_ACCOUNT_ID'),
			accessKeyId: ServerConfig.required('R2_ACCESS_KEY_ID'),
			secretAccessKey: ServerConfig.required('R2_SECRET_ACCESS_KEY'),
			bucket: ServerConfig.required('R2_BUCKET'),
		};
	}

	private static required(name: string) {
		const value = process.env[name];
		if (!value) {
			throw new Error(`${name} is not set; see .env.example.`);
		}
		return value;
	}
}
