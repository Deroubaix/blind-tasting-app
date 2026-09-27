import { describe, expect, it } from 'vitest';
import { forgotPasswordSchema, loginSchema, signupSchema } from './auth';

describe('email normalisation', () => {
	it('stores and looks up emails lowercase and trimmed', () => {
		expect(
			signupSchema.parse({ displayName: 'Tom', email: ' Tom@X.com ', password: 'correct-horse-battery' }).email,
		).toBe('tom@x.com');
		expect(loginSchema.parse({ email: 'TOM@x.COM', password: 'x' }).email).toBe('tom@x.com');
		expect(forgotPasswordSchema.parse({ email: 'Tom@X.com' }).email).toBe('tom@x.com');
	});

	it('still rejects an address that is not an email', () => {
		expect(loginSchema.safeParse({ email: 'not-an-email', password: 'x' }).success).toBe(false);
	});
});
