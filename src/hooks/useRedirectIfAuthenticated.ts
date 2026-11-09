'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthenticatedUser from './useAuthenticatedUser';
import { DEFAULT_AFTER_LOGIN } from '../utils/AuthRedirectUtils';

/**
 * Bounces an already-signed-in user away from the auth pages.
 *
 * Gated on `isInitialLoading` (the one-off `fetchMe` on mount) rather than `isLoading`, which also
 * flips during sign-in and would fire the redirect mid-submit.
 */
export default function useRedirectIfAuthenticated(destination = DEFAULT_AFTER_LOGIN) {
	const router = useRouter();
	const { user, isInitialLoading } = useAuthenticatedUser();

	const isRedirecting = !isInitialLoading && !!user;

	useEffect(() => {
		if (isRedirecting) {
			router.replace(destination);
		}
	}, [isRedirecting, router, destination]);

	return { isRedirecting };
}
