'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthProvider } from '../../components/auth/AuthProvider';
import { useText } from '../../i18n/LanguageProvider';
import { userText } from '../../i18n/user';

/** Asks first: a link from another site shouldn't be able to log the user out. */
export default function LogoutPage() {
	const { signOut } = useAuthProvider();
	const router = useRouter();
	const [busy, setBusy] = useState(false);
	const t = useText(userText).logout;

	const logOut = async () => {
		setBusy(true);
		await signOut();
		router.push('/');
	};

	return (
		<div className="empty-state">
			<p>{t.confirm}</p>
			<button type="button" className="btn-primary" onClick={logOut} disabled={busy}>
				{busy ? t.loggingOut : t.logOut}
			</button>
		</div>
	);
}
