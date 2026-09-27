import { describe, expect, it } from 'vitest';
import { RATE_LIMITS, clientIp, minutesUntil } from './rateLimit';

const request = (headers: Record<string, string>) => new Request('http://app.test/api', { headers });

describe('clientIp', () => {
	it('takes the client, the first address a proxy lists', () => {
		expect(clientIp(request({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' }))).toBe('203.0.113.7');
	});

	it('falls back to X-Real-IP, then to one shared bucket', () => {
		expect(clientIp(request({ 'x-real-ip': '198.51.100.4' }))).toBe('198.51.100.4');
		expect(clientIp(request({}))).toBe('unknown');
	});
});

describe('minutesUntil', () => {
	const rule = RATE_LIMITS.loginEmail; // 15-minute window
	const start = new Date('2026-09-27T12:00:00Z');

	it('counts whole minutes left, rounding up', () => {
		expect(minutesUntil(start, rule, start.getTime() + 3 * 60_000 + 1)).toBe(12);
	});

	it('never says zero', () => {
		expect(minutesUntil(start, rule, start.getTime() + 15 * 60_000)).toBe(1);
	});
});

describe('RATE_LIMITS', () => {
	it('allows five wrong passwords per account per quarter hour', () => {
		expect(RATE_LIMITS.loginEmail).toMatchObject({ limit: 5, windowMs: 15 * 60_000 });
	});
});
