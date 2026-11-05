'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthProvider } from '../../components/auth/AuthProvider';
import { useText } from '../../i18n/LanguageProvider';
import { userText } from '../../i18n/user';

export default function LogoutPage() {
	const { signOut } = useAuthProvider();
	const router = useRouter();
	const hasSignedOut = useRef(false);
	const t = useText(userText).logout;

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
		<div className="empty-state">
			<p>{t.loggingOut}</p>
		</div>
	);
}
