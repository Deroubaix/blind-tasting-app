import { describe, expect, it } from 'vitest';
import { translatedResolver } from './FormUtils';
import { loginSchema, resetPasswordSchema, signupSchema } from '../schemas/auth';
import { userText } from '../i18n/user';

// The resolver matches the schemas' English messages exactly, so an edited message would silently stay English.
const pt = Object.values(userText.pt.validation).map((v) => (typeof v === 'function' ? v(12) : v));

describe('translatedResolver', () => {
	it('words every schema message in Portuguese', () => {
		const errors = [
			translatedResolver(signupSchema, 'pt')({ displayName: '', email: '', password: '' }),
			translatedResolver(signupSchema, 'pt')({ displayName: 'A', email: 'not-an-email', password: 'short' }),
			translatedResolver(loginSchema, 'pt')({ email: '', password: '' }),
			translatedResolver(resetPasswordSchema, 'pt')({ password: '', confirmPassword: '' }),
			translatedResolver(
				resetPasswordSchema,
				'pt',
			)({ password: 'a-long-password-1', confirmPassword: 'different' }),
		].flatMap((e) => Object.values(e));
		expect(errors.length).toBe(10);
		for (const message of errors) {
			expect(pt).toContain(message);
		}
	});

	it('leaves English alone', () => {
		expect(translatedResolver(loginSchema, 'en')({ email: '', password: '' })).toEqual({
			email: 'Email is required',
			password: 'Password is required',
		});
	});
});
