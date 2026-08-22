'use client';

import React, { createContext, useCallback, useContext, useState, useMemo, useEffect } from 'react';
import { type AuthenticatedUser } from '../../services/IAuthService';
import { SessionAuthService } from '../../services/SessionAuthService';

export type AuthContextValue = {
	user: AuthenticatedUser | null;
	signIn: (email: string, password: string) => Promise<void>;
	signUp: (displayName: string, email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
	requestPasswordReset: (email: string) => Promise<void>;
	completePasswordReset: (email: string, token: string, password: string) => Promise<void>;
	isLoading: boolean;
	isInitialLoading: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<AuthenticatedUser | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isInitialLoading, setIsInitialLoading] = useState(true);
	const authService = useMemo(() => new SessionAuthService(), []);

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const fetchedUser = await authService.fetchMe();
				setUser(fetchedUser);
			} catch (error) {
				console.warn('Failed to fetch user:', error);
			} finally {
				setIsInitialLoading(false);
			}
		};
		fetchUser();
	}, [authService]);

	const signIn = useCallback(
		async (email: string, password: string) => {
			setIsLoading(true);
			try {
				const signedInUser = await authService.signIn(email, password);
				setUser(signedInUser);
			} finally {
				setIsLoading(false);
			}
		},
		[authService],
	);

	const signUp = useCallback(
		async (displayName: string, email: string, password: string) => {
			setIsLoading(true);
			try {
				await authService.signUp(displayName, email, password);
			} finally {
				setIsLoading(false);
			}
		},
		[authService],
	);

	const signOut = useCallback(async () => {
		setIsLoading(true);
		try {
			await authService.signOut();
			setUser(null);
		} finally {
			setIsLoading(false);
		}
	}, [authService]);

	const requestPasswordReset = useCallback(
		async (email: string) => {
			await authService.requestPasswordReset(email);
		},
		[authService],
	);

	const completePasswordReset = useCallback(
		async (email: string, token: string, password: string) => {
			await authService.completePasswordReset(email, token, password);
		},
		[authService],
	);

	const contextValue = useMemo(
		() => ({
			user,
			signIn,
			signUp,
			signOut,
			requestPasswordReset,
			completePasswordReset,
			isLoading,
			isInitialLoading,
		}),
		[user, signIn, signUp, signOut, requestPasswordReset, completePasswordReset, isLoading, isInitialLoading],
	);

	return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuthProvider() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuthProvider must be used within an AuthProvider');
	}
	return context;
}
