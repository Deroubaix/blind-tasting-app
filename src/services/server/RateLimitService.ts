import { type PrismaClient } from '@prisma/client';
import { apiError } from '../../utils/ApiUtils';
import { MINUTE, type RateLimitRule, keyFor, minutesUntil } from '../../utils/RateLimitUtils';

const tooMany = (minutes: number) => apiError(429, 'tooManyAttempts', minutes);

/**
 * Attempt limits for the auth routes, counted in Postgres rather than in memory so they hold
 * across restarts and across however many copies of the app a host runs.
 */
export default class RateLimitService {
	constructor(private readonly _prisma: PrismaClient) {}

	/**
	 * Counts one attempt and throws a 429 once the limit is passed. One statement, so two requests
	 * arriving together cannot both read the old count and slip through. Returns the count so far.
	 */
	public async consume(rule: RateLimitRule, identifier: string): Promise<number> {
		const windowSeconds = rule.windowMs / 1000;
		const [row] = await this._prisma.$queryRaw<{ count: number; windowStart: Date }[]>`
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

		this.sweepOccasionally();

		if (row.count > rule.limit) {
			throw tooMany(minutesUntil(row.windowStart, rule));
		}
		return row.count;
	}

	/** Throws a 429 if the limit is already used up, without counting this attempt. */
	public async check(rule: RateLimitRule, identifier: string): Promise<void> {
		const row = await this._prisma.rateLimit.findUnique({ where: { key: keyFor(rule, identifier) } });
		if (!row || row.windowStart.getTime() + rule.windowMs <= Date.now()) {
			return;
		}
		if (row.count >= rule.limit) {
			throw tooMany(minutesUntil(row.windowStart, rule));
		}
	}

	/** Forgets the count, e.g. after a successful login. */
	public async reset(rule: RateLimitRule, identifier: string): Promise<void> {
		await this._prisma.rateLimit.deleteMany({ where: { key: keyFor(rule, identifier) } });
	}

	/** Drops counters idle for a day, on about one attempt in a hundred, so the table stays small. */
	private sweepOccasionally() {
		if (Math.random() < 0.01) {
			this._prisma.rateLimit
				.deleteMany({ where: { windowStart: { lt: new Date(Date.now() - 24 * 60 * MINUTE) } } })
				.catch(() => undefined);
		}
	}
}
