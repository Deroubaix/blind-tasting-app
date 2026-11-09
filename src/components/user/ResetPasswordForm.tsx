'use client';

import React, { type ReactNode, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from '@mantine/form';
import { IconCheck, IconEye, IconEyeOff } from '@tabler/icons-react';
import Form from '../form/Form';
import FormControl from '../form/FormControl';
import Label from '../form/Label';
import TextInput from '../form/TextInput';
import { JsonApiError } from '../../utils/ErrorUtils';
import { DEFAULT_AFTER_LOGIN } from '../../utils/AuthRedirectUtils';
import { resetPasswordSchema, PASSWORD_MIN_LENGTH, type ResetPasswordFormType } from '../../schemas/auth';
import useLoadTracker from '../../hooks/useLoadTracker';
import useRedirectIfAuthenticated from '../../hooks/useRedirectIfAuthenticated';
import AuthShell from './AuthShell';
import { useAuthProvider } from '../auth/AuthProvider';
import { useLang, useText } from '../../i18n/LanguageProvider';
import { translatedResolver } from '../../utils/FormUtils';
import { userText } from '../../i18n/user';

export default function ResetPasswordForm() {
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState<ReactNode | null>(null);

	const router = useRouter();
	const searchParams = useSearchParams();
	const { completePasswordReset, signIn } = useAuthProvider();
	const { isLoading, addLoader, removeLoader } = useLoadTracker();
	const { lang } = useLang();
	const { reset: t, shared } = useText(userText);

	const token = searchParams.get('token') ?? '';
	const email = searchParams.get('email') ?? '';
	const isInvalidLink = !token || !email;

	useRedirectIfAuthenticated();

	const form = useForm<ResetPasswordFormType>({
		initialValues: { password: '', confirmPassword: '' },
		validate: translatedResolver<ResetPasswordFormType>(resetPasswordSchema, lang),
	});

	const handleSubmit = async (values: ResetPasswordFormType) => {
		const loader = addLoader();
		setError(null);

		try {
			await completePasswordReset(email, token, values.password);
			await signIn(email, values.password);
			router.push(DEFAULT_AFTER_LOGIN);
		} catch (err) {
			const apiError = JsonApiError.create(err);

			if (apiError.statusCode === 401) {
				setError(
					<>
						{t.expiredBefore}
						<Link href="/forgot-password">{t.expiredLink}</Link>
						{t.expiredAfter}
					</>,
				);
			} else {
				setError(apiError.message || shared.tryAgain);
			}
		} finally {
			removeLoader(loader);
		}
	};

	if (isInvalidLink) {
		return (
			<AuthShell>
				<header className="auth-head">
					<h1>{t.invalidHeading}</h1>
					<p className="auth-head__sub">{t.invalidSubheading}</p>
				</header>
				<p className="auth-switch">
					<Link href="/forgot-password" className="auth-switch__link">
						{t.requestNew}
					</Link>
				</p>
			</AuthShell>
		);
	}

	const longEnough = form.values.password.length >= PASSWORD_MIN_LENGTH;

	return (
		<AuthShell>
			<header className="auth-head">
				<h1>{t.heading}</h1>
				<p className="auth-head__sub">{t.subheading(PASSWORD_MIN_LENGTH)}</p>
			</header>

			<Form className="auth-form" form={form} onSubmit={handleSubmit} disabled={isLoading}>
				{error && <p className="auth-error">{error}</p>}

				<FormControl className="auth-field" name="password">
					<Label>{t.newPassword}</Label>
					<div className="auth-input-wrapper">
						<TextInput
							className="ledger-field"
							type={showPassword ? 'text' : 'password'}
							autoComplete="new-password"
							aria-describedby="reset-password-hint"
						/>
						<button
							type="button"
							className="auth-eye-btn"
							onClick={() => setShowPassword((v) => !v)}
							aria-label={showPassword ? shared.hidePassword : shared.showPassword}
						>
							{showPassword ? <IconEyeOff size={22} stroke={1.5} /> : <IconEye size={22} stroke={1.5} />}
						</button>
					</div>
					<span className={`auth-hint${longEnough ? ' auth-hint--met' : ''}`} id="reset-password-hint">
						{longEnough && <IconCheck size={16} stroke={2.4} aria-hidden="true" />}
						{shared.minChars(PASSWORD_MIN_LENGTH)}
					</span>
				</FormControl>

				<FormControl className="auth-field" name="confirmPassword">
					<Label>{t.confirmPassword}</Label>
					<TextInput
						className="ledger-field"
						type={showPassword ? 'text' : 'password'}
						autoComplete="new-password"
					/>
				</FormControl>

				<button className="btn-primary btn-primary--block auth-submit" type="submit" disabled={isLoading}>
					{isLoading ? t.saving : t.submit}
				</button>
			</Form>
		</AuthShell>
	);
}
