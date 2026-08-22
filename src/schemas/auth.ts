import { z } from 'zod';

/** Minimum length enforced on any *newly chosen* password (signup and reset). */
export const PASSWORD_MIN_LENGTH = 12;

const email = z.string().min(1, 'Email is required').email('Enter a valid email address');

const newPassword = z
	.string()
	.min(1, 'Password is required')
	.min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`);

/**
 * Login deliberately only checks for a non-empty password: accounts created before the
 * 12-character rule still have shorter passwords and must remain able to sign in.
 */
export const loginSchema = z.object({
	email,
	password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
	displayName: z.string().min(1, 'Display name is required'),
	email,
	password: newPassword,
});

export const forgotPasswordSchema = z.object({
	email,
});

/** Client-side shape for the reset form, including the confirmation field. */
export const resetPasswordSchema = z
	.object({
		password: newPassword,
		confirmPassword: z.string().min(1, 'Please confirm your password'),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	});

/** Server-side shape for the reset endpoint — no confirmation field on the wire. */
export const resetPasswordRequestSchema = z.object({
	email,
	token: z.string().min(1, 'Token is required'),
	password: newPassword,
});

export type LoginFormType = z.infer<typeof loginSchema>;
export type SignupFormType = z.infer<typeof signupSchema>;
export type ForgotPasswordFormType = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormType = z.infer<typeof resetPasswordSchema>;
