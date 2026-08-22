'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthProvider } from '../../components/auth/AuthProvider';

export default function LogoutPage() {
	const { signOut } = useAuthProvider();
	const router = useRouter();
	const hasSignedOut = useRef(false);

	useEffect(() => {
		// Runs exactly once. signOut and router are stable identities, so listing them satisfies
		// the dependency rule without re-firing; the ref guards against StrictMode's double
		// invocation in development.
		if (hasSignedOut.current) {
			return;
		}
		hasSignedOut.current = true;

		signOut().then(() => {
			router.push('/');
		});
	}, [signOut, router]);

	return (
		<div style={{ padding: '2rem', textAlign: 'center' }}>
			<p>Logging out...</p>
		</div>
	);
}
