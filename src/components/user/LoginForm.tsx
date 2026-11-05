'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from '@mantine/form';
import { IconArrowRight, IconEye, IconEyeOff } from '@tabler/icons-react';
import Form from '../form/Form';
import FormControl from '../form/FormControl';
import Label from '../form/Label';
import TextInput from '../form/TextInput';
import { useToastProvider } from '../toast/ToastProvider';
import { JsonApiError } from '../../utils/ErrorUtils';
import { loginSchema, type LoginFormType } from '../../schemas/auth';
import useLoadTracker from '../../hooks/useLoadTracker';
import useRedirectIfAuthenticated from '../../hooks/useRedirectIfAuthenticated';
import AuthShell from './AuthShell';
import { useAuthProvider } from '../auth/AuthProvider';
import { isSavingTasting, safeRedirect } from '../../utils/AuthRedirectUtils';
import { useLang, useText } from '../../i18n/LanguageProvider';
import { translatedResolver } from '../../utils/FormUtils';
import { userText } from '../../i18n/user';

export default function LoginForm() {
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const router = useRouter();
	const searchParams = useSearchParams();
	const { signIn } = useAuthProvider();
	const { showToast } = useToastProvider();
	const { isLoading, addLoader, removeLoader } = useLoadTracker();
	const { lang } = useLang();
	const { login: t, shared } = useText(userText);

	const redirectTo = safeRedirect(searchParams.get('r'));
	const signupHref = `/signup?r=${encodeURIComponent(redirectTo)}`;

	useRedirectIfAuthenticated(redirectTo);

	const form = useForm<LoginFormType>({
		initialValues: { email: '', password: '' },
		validate: translatedResolver<LoginFormType>(loginSchema, lang),
	});

	const handleSubmit = async (values: LoginFormType) => {
		const loader = addLoader();
		setError(null);

		try {
			await signIn(values.email, values.password);
			showToast({ title: t.welcomeTitle, children: t.welcomeBody, color: 'success' });
			router.push(redirectTo);
		} catch (err) {
			const apiError = JsonApiError.create(err);
			const message = apiError.statusCode === 401 ? t.incorrect : apiError.message;

			// Shown on the form only; a toast repeating it said the same thing twice.
			setError(message);
		} finally {
			removeLoader(loader);
		}
	};

	return (
		<AuthShell
			contextLink={{
				href: signupHref,
				label: shared.signUp,
				contextLabel: t.contextLabel,
			}}
		>
			<header className="auth-card-head">
				<span className="page-eyebrow">{t.eyebrow}</span>
				<h1>
					{t.headingBefore}
					<em>{t.headingEm}</em>
					{t.headingAfter}
				</h1>
				{isSavingTasting(redirectTo) ? (
					<p className="body-copy">
						<strong>{shared.waiting}</strong>
						{t.waitingRest}
					</p>
				) : (
					<p className="body-copy">{t.subheading}</p>
				)}
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

				<FormControl className="auth-field" name="password">
					<div className="auth-label-row">
						<Label className="item-label">{shared.password}</Label>
						<Link href="/forgot-password" className="auth-forgot">
							{t.forgot}
						</Link>
					</div>
					<div className="auth-input-wrapper">
						<TextInput
							className="ledger-field"
							type={showPassword ? 'text' : 'password'}
							autoComplete="current-password"
							placeholder="••••••••"
						/>
						<button
							type="button"
							className="auth-eye-btn"
							onClick={() => setShowPassword((v) => !v)}
							aria-label={showPassword ? shared.hidePassword : shared.showPassword}
						>
							{showPassword ? <IconEyeOff size={24} stroke={1} /> : <IconEye size={24} stroke={1} />}
						</button>
					</div>
				</FormControl>

				<button className="btn-primary btn-primary--block auth-submit" type="submit" disabled={isLoading}>
					{isLoading ? t.loggingIn : shared.logIn}
					<IconArrowRight size={15} />
				</button>
			</Form>

			<p className="auth-switch">
				{t.newHere}{' '}
				<Link href={signupHref} className="auth-switch__link">
					{shared.signUp}
				</Link>
			</p>
		</AuthShell>
	);
}
