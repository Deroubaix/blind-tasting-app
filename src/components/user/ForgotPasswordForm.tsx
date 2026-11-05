'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from '@mantine/form';
import { IconArrowRight, IconCheck } from '@tabler/icons-react';
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
		<AuthShell contextLink={{ href: '/login', label: shared.logIn, contextLabel: shared.rememberIt }}>
			{submittedEmail ? (
				<>
					<header className="auth-card-head">
						<span className="page-eyebrow">{t.sentEyebrow}</span>
						<h1>
							{t.sentBefore}
							<em>{t.sentEm}</em>
							{t.sentAfter}
						</h1>
						<p className="body-copy">
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
					<header className="auth-card-head">
						<span className="page-eyebrow">{t.eyebrow}</span>
						<h1>
							{t.headingBefore}
							<em>{t.headingEm}</em>
							{t.headingAfter}
						</h1>
						<p className="body-copy">{t.subheading}</p>
					</header>

					<Form className="auth-form" form={form} onSubmit={handleSubmit} disabled={isLoading}>
						{error && <p className="auth-error">{error}</p>}

						<FormControl className="auth-field" name="email">
							<Label className="item-label">{shared.email}</Label>
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
							<IconArrowRight size={15} />
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
