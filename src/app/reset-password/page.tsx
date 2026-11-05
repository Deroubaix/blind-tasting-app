import { Suspense } from 'react';
import ResetPasswordForm from '../../components/user/ResetPasswordForm';
import { pageTitle } from '../../i18n/server';
import { userText } from '../../i18n/user';

export const generateMetadata = pageTitle({ en: userText.en.pages.resetPassword, pt: userText.pt.pages.resetPassword });

export default function ResetPasswordPage() {
	return (
		<Suspense>
			<ResetPasswordForm />
		</Suspense>
	);
}
