'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthenticatedUser from './UseAuthenticatedUser';

/**
 * Bounces an already-signed-in user away from the auth pages.
 *
 * Gated on `isInitialLoading` (the one-off `fetchMe` on mount) rather than `isLoading`, which also
 * flips during sign-in and would fire the redirect mid-submit.
 */
export default function useRedirectIfAuthenticated(destination = '/archives') {
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
