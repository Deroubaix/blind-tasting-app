import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { middleware } from './middleware';

const call = (method: string, headers: Record<string, string>) =>
	middleware(
		new NextRequest('http://app.test/api/auth/login', { method, headers: { host: 'app.test', ...headers } }),
	);

describe('cross-site check', () => {
	it('refuses a change posted from another site', async () => {
		const response = call('POST', { origin: 'https://evil.example' });
		expect(response.status).toBe(403);
		expect((await response.json()).statusCode).toBe(403);
		expect(call('POST', { 'sec-fetch-site': 'cross-site' }).status).toBe(403);
		expect(call('DELETE', { origin: 'null' }).status).toBe(403);
	});

	it("lets the app's own pages through", () => {
		expect(call('POST', { origin: 'http://app.test', 'sec-fetch-site': 'same-origin' }).status).toBe(200);
	});

	it('leaves reads alone', () => {
		expect(call('GET', { origin: 'https://evil.example' }).status).toBe(200);
	});
});
