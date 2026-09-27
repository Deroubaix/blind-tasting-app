import { createHash } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { JsonApiError } from '../utils/ErrorUtils';

const prisma = new PrismaClient();

/**
 * Attempt limits for the auth routes, counted in Postgres rather than in memory so they hold
 * across restarts and across however many copies of the app a host runs — an in-memory counter
 * resets on every cold start and is per-instance on serverless hosts.
 *
 * Fixed windows: the first attempt opens a window, later ones count against it, and once it has
 * passed the next attempt opens a fresh one.
 */
export type RateLimitRule = {
	/** Part of the stored key, so different rules never share a counter. */
	name: string;
	limit: number;
	windowMs: number;
};

const MINUTE = 60 * 1000;

export const RATE_LIMITS = {
	/** Wrong passwords for one account. Cleared by a successful login. */
	loginEmail: { name: 'login-email', limit: 5, windowMs: 15 * MINUTE },
	/** Every login attempt from one address, so one place cannot work through many accounts. */
	loginIp: { name: 'login-ip', limit: 30, windowMs: 15 * MINUTE },
	signupIp: { name: 'signup-ip', limit: 5, windowMs: 60 * MINUTE },
	/** Reset mail to one address — stops an inbox being flooded. */
	forgotEmail: { name: 'forgot-email', limit: 3, windowMs: 60 * MINUTE },
	forgotIp: { name: 'forgot-ip', limit: 10, windowMs: 60 * MINUTE },
	resetIp: { name: 'reset-ip', limit: 10, windowMs: 15 * MINUTE },
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

function keyFor(rule: RateLimitRule, identifier: string) {
	return createHash('sha256').update(`${rule.name}:${identifier.trim().toLowerCase()}`).digest('hex');
}

/** Whole minutes until the window reopens, never less than one. */
export function minutesUntil(windowStart: Date, rule: RateLimitRule, now = Date.now()): number {
	return Math.max(1, Math.ceil((windowStart.getTime() + rule.windowMs - now) / MINUTE));
}

function tooMany(minutes: number) {
	return new JsonApiError(
		'TooManyRequests',
		`Too many attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`,
		429,
	);
}

/**
 * Counts one attempt and throws a 429 once the limit is passed. One statement, so two requests
 * arriving together cannot both read the old count and slip through.
 */
export async function consume(rule: RateLimitRule, identifier: string): Promise<void> {
	const windowSeconds = rule.windowMs / 1000;
	const [row] = await prisma.$queryRaw<{ count: number; windowStart: Date }[]>`
		INSERT INTO "RateLimit" ("key", "count", "windowStart")
		VALUES (${keyFor(rule, identifier)}, 1, now())
		ON CONFLICT ("key") DO UPDATE SET
			"count" = CASE
				WHEN "RateLimit"."windowStart" < now() - make_interval(secs => ${windowSeconds}) THEN 1
				ELSE "RateLimit"."count" + 1
			END,
			"windowStart" = CASE
				WHEN "RateLimit"."windowStart" < now() - make_interval(secs => ${windowSeconds}) THEN now()
				ELSE "RateLimit"."windowStart"
			END
		RETURNING "count", "windowStart"`;

	sweepOccasionally();

	if (row.count > rule.limit) {
		throw tooMany(minutesUntil(row.windowStart, rule));
	}
}

/** Throws a 429 if the limit is already used up, without counting this attempt. */
export async function check(rule: RateLimitRule, identifier: string): Promise<void> {
	const row = await prisma.rateLimit.findUnique({ where: { key: keyFor(rule, identifier) } });
	if (!row || row.windowStart.getTime() + rule.windowMs <= Date.now()) {
		return;
	}
	if (row.count >= rule.limit) {
		throw tooMany(minutesUntil(row.windowStart, rule));
	}
}

/** Forgets the count, e.g. after a successful login. */
export async function reset(rule: RateLimitRule, identifier: string): Promise<void> {
	await prisma.rateLimit.deleteMany({ where: { key: keyFor(rule, identifier) } });
}

/** Drops counters idle for a day, on about one attempt in a hundred, so the table stays small. */
function sweepOccasionally() {
	if (Math.random() < 0.01) {
		prisma.rateLimit
			.deleteMany({ where: { windowStart: { lt: new Date(Date.now() - 24 * 60 * MINUTE) } } })
			.catch(() => undefined);
	}
}
