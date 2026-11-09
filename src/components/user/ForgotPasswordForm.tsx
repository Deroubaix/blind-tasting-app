'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from '@mantine/form';
import { IconCheck } from '@tabler/icons-react';
import Form from '../form/Form';
import FormControl from '../form/FormControl';
import Label from '../form/Label';
import TextInput from '../form/TextInput';
import { JsonApiError } from '../../utils/ErrorUtils';
import { forgotPasswordSchema, type ForgotPasswordFormType } from '../../schemas/auth';
import useLoadTracker from '../../hooks/useLoadTracker';
import useRedirectIfAuthenticated from '../../hooks/useRedirectIfAuthenticated';
import AuthShell from './AuthShell';
import { useAuthProvider } from '../auth/AuthProvider';
import { useLang, useText } from '../../i18n/LanguageProvider';
import { translatedResolver } from '../../utils/FormUtils';
import { userText } from '../../i18n/user';

export default function ForgotPasswordForm() {
	const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const { requestPasswordReset } = useAuthProvider();
	const { isLoading, addLoader, removeLoader } = useLoadTracker();
	const { lang } = useLang();
	const { forgot: t, shared } = useText(userText);

	useRedirectIfAuthenticated();

	const form = useForm<ForgotPasswordFormType>({
		initialValues: { email: '' },
		validate: translatedResolver<ForgotPasswordFormType>(forgotPasswordSchema, lang),
	});

	const handleSubmit = async (values: ForgotPasswordFormType) => {
		const loader = addLoader();
		setError(null);

		try {
			await requestPasswordReset(values.email);
			setSubmittedEmail(values.email);
		} catch (err) {
			setError(JsonApiError.create(err).message || shared.tryAgain);
		} finally {
			removeLoader(loader);
		}
	};

	return (
		<AuthShell>
			{submittedEmail ? (
				<>
					<header className="auth-head">
						<h1>{t.sentHeading}</h1>
						<p className="auth-head__sub">
							{t.sentLedeBefore}
							<strong>{submittedEmail}</strong>
							{t.sentLedeAfter}
						</p>
					</header>

					<div className="auth-success-icon">
						<IconCheck size={20} strokeWidth={2.5} />
					</div>

					<p className="auth-switch">
						<Link href="/login" className="auth-switch__link">
							{shared.backToLogIn}
						</Link>
					</p>
				</>
			) : (
				<>
					<header className="auth-head">
						<h1>{t.heading}</h1>
						<p className="auth-head__sub">{t.subheading}</p>
					</header>

					<Form className="auth-form" form={form} onSubmit={handleSubmit} disabled={isLoading}>
						{error && (
							<p className="auth-error" role="alert">
								{error}
							</p>
						)}

						<FormControl className="auth-field" name="email">
							<Label>{shared.email}</Label>
							<TextInput
								className="ledger-field"
								type="email"
								autoComplete="email"
								placeholder={shared.emailPlaceholder}
							/>
						</FormControl>

						<button
							className="btn-primary btn-primary--block auth-submit"
							type="submit"
							disabled={isLoading}
						>
							{isLoading ? t.sending : t.send}
						</button>
					</Form>

					<p className="auth-switch">
						<Link href="/login" className="auth-switch__link">
							{shared.backToLogIn}
						</Link>
					</p>
				</>
			)}
		</AuthShell>
	);
}
