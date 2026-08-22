'use client';

import FetchUtils from '../utils/FetchUtils';
import { type AuthenticatedUser, type IAuthService } from './IAuthService';

/**
 * The single client-side entry point for every auth call. Components should reach this through
 * AuthProvider/useAuthProvider rather than instantiating it directly.
 */
export class SessionAuthService implements IAuthService {
	async signIn(email: string, password: string): Promise<AuthenticatedUser | null> {
		const request = FetchUtils.postJson<AuthenticatedUser>('/api/auth/login', { email, password });
		return await request.response;
	}

	async signUp(displayName: string, email: string, password: string): Promise<void> {
		const request = FetchUtils.post('/api/auth/signup', { displayName, email, password });
		await request.response;
	}

	async signOut(): Promise<void> {
		try {
			await FetchUtils.get('/api/auth/logout', { credentials: 'include' }).response;
		} catch (err) {
			// A failed logout still clears client state, so swallow rather than block the user.
			console.warn('Sign-out failed:', err);
		}
	}

	async fetchMe(): Promise<AuthenticatedUser | null> {
		try {
			const request = FetchUtils.getJson<AuthenticatedUser>('/api/user/me', {
				credentials: 'include',
			});
			return await request.response;
		} catch {
			// Not being logged in is the expected path here, not an error worth surfacing.
			return null;
		}
	}

	async updateUser(user: AuthenticatedUser): Promise<AuthenticatedUser> {
		const request = FetchUtils.postJson<AuthenticatedUser>('/api/user/me', user);
		return await request.response;
	}

	async requestPasswordReset(email: string): Promise<void> {
		const request = FetchUtils.post('/api/auth/forgot-password', { email });
		await request.response;
	}

	async completePasswordReset(email: string, token: string, password: string): Promise<void> {
		const request = FetchUtils.post('/api/auth/reset-password', { email, token, password });
		await request.response;
	}
}

export default SessionAuthService;
