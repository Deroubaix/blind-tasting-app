import { Suspense } from 'react';
import ResetPasswordForm from '../../components/user/ResetPasswordForm';
import { type Metadata } from 'next';

export const metadata: Metadata = {
	title: "Reset Password — The Sommelier's Ledger",
};

export default function ResetPasswordPage() {
	return (
		<Suspense>
			<ResetPasswordForm />
		</Suspense>
	);
}
