import { createHash } from 'node:crypto';

/** A fixed window: the first attempt opens it, later ones count against it until it has passed. */
export type RateLimitRule = {
	/** Part of the stored key, so different rules never share a counter. */
	name: string;
	limit: number;
	windowMs: number;
};

export const MINUTE = 60 * 1000;

export const RATE_LIMITS = {
	/** Wrong passwords for one account from one address. Cleared by a successful login. */
	loginEmail: { name: 'login-email-ip', limit: 5, windowMs: 15 * MINUTE },
	/** Wrong passwords for one account from anywhere: high, so a stranger can't easily lock the owner out. */
	loginAccount: { name: 'login-email', limit: 50, windowMs: 15 * MINUTE },
	/** Every login attempt from one address, so one place cannot work through many accounts. */
	loginIp: { name: 'login-ip', limit: 30, windowMs: 15 * MINUTE },
	signupIp: { name: 'signup-ip', limit: 5, windowMs: 60 * MINUTE },
	/** Reset mail to one address — stops an inbox being flooded. */
	forgotEmail: { name: 'forgot-email', limit: 3, windowMs: 60 * MINUTE },
	forgotIp: { name: 'forgot-ip', limit: 10, windowMs: 60 * MINUTE },
	resetIp: { name: 'reset-ip', limit: 10, windowMs: 15 * MINUTE },
	/** Looking up or joining flights by code, so codes can't be guessed in bulk. */
	flightCode: { name: 'flight-code', limit: 30, windowMs: 15 * MINUTE },
	/** Photo upload URLs per account: far more than anyone saves, far less than abuse needs. */
	photoSign: { name: 'photo-sign', limit: 60, windowMs: 60 * MINUTE },
	/** Wrong passwords when deleting an account. */
	deleteAccount: { name: 'delete-account', limit: 5, windowMs: 15 * MINUTE },
	// Building the archive reads every photo, so repeated downloads are the costliest request there is.
	exportAccount: { name: 'export-account', limit: 10, windowMs: 60 * MINUTE },
} satisfies Record<string, RateLimitRule>;

/**
 * The caller's address, as reported by the proxy in front of the app. Only as trustworthy as that
 * proxy: behind one that sets X-Forwarded-For (Vercel, most hosts) the first entry is the client;
 * exposed directly, a client can write the header itself. Without one, everyone shares "unknown",
 * which errs toward limiting too much rather than not at all.
 */
export function clientIp(request: Request): string {
	const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
	return forwarded || request.headers.get('x-real-ip')?.trim() || 'unknown';
}

export function keyFor(rule: RateLimitRule, identifier: string) {
	return createHash('sha256').update(`${rule.name}:${identifier.trim().toLowerCase()}`).digest('hex');
}

/** Whole minutes until the window reopens, never less than one. */
export function minutesUntil(windowStart: Date, rule: RateLimitRule, now = Date.now()): number {
	return Math.max(1, Math.ceil((windowStart.getTime() + rule.windowMs - now) / MINUTE));
}
