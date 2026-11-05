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
import { useToastProvider } from '../../toast/ToastProvider';
import { JsonApiError } from '../../utils/ErrorUtils';
import { signupSchema, PASSWORD_MIN_LENGTH, type SignupFormType } from '../../schemas/auth';
import useLoadTracker from '../../hooks/useLoadTracker';
import useRedirectIfAuthenticated from '../../hooks/useRedirectIfAuthenticated';
import AuthHeader from '../layout/AuthHeader';
import Footer from '../layout/Footer';
import { useAuthProvider } from '../auth/AuthProvider';
import { isSavingTasting, safeRedirect } from '../../utils/AuthRedirectUtils';
import { useLang, useText } from '../../i18n/LanguageProvider';
import { translatedResolver } from '../../utils/FormUtils';
import { userText } from '../../i18n/user';

export default function SignupForm() {
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const router = useRouter();
	const searchParams = useSearchParams();
	const { signUp, signIn } = useAuthProvider();
	const { showToast } = useToastProvider();
	const { isLoading, addLoader, removeLoader } = useLoadTracker();
	const { lang } = useLang();
	const { signup: t, shared } = useText(userText);

	const redirectTo = safeRedirect(searchParams.get('r'));

	useRedirectIfAuthenticated(redirectTo);

	const form = useForm<SignupFormType>({
		initialValues: { displayName: '', email: '', password: '' },
		validate: translatedResolver<SignupFormType>(signupSchema, lang),
	});

	const handleSubmit = async (values: SignupFormType) => {
		const loader = addLoader();
		setError(null);

		try {
			await signUp(values.displayName, values.email, values.password);
			await signIn(values.email, values.password);

			showToast({ title: t.welcomeTitle, children: t.welcomeBody, color: 'success' });
			router.push(redirectTo);
		} catch (err) {
			const isSyntaxError = err instanceof SyntaxError;
			const apiError = isSyntaxError ? JsonApiError.create(new Error(t.unexpected)) : JsonApiError.create(err);

			// Shown on the form only, as on login.
			setError(apiError.message || t.failed);
		} finally {
			removeLoader(loader);
		}
	};

	return (
		<div className="auth-page">
			<AuthHeader
				contextLink={{
					href: '/login',
					label: shared.logIn,
					contextLabel: t.contextLabel,
				}}
			/>

			<main className="auth-main">
				<div className="auth-container">
					<header className="auth-card-head">
						<span className="page-eyebrow">{t.eyebrow}</span>
						<h1>
							{t.headingBefore}
							<em>{t.headingEm}</em>
							{t.headingAfter}
						</h1>
						{isSavingTasting(redirectTo) ? (
							<p className="auth-subheading">
								<strong>{shared.waiting}</strong>
								{t.waitingRest}
							</p>
						) : (
							<p className="auth-subheading">
								<strong>{t.pitch}</strong>
								{t.pitchRest}
							</p>
						)}
					</header>

					<Form className="auth-form" form={form} onSubmit={handleSubmit} disabled={isLoading}>
						{error && <p className="auth-error">{error}</p>}

						<FormControl className="auth-field" name="displayName">
							<Label className="item-label">{t.displayName}</Label>
							<TextInput
								className="auth-input"
								type="text"
								autoComplete="name"
								placeholder={t.displayNamePlaceholder}
							/>
						</FormControl>

						<FormControl className="auth-field" name="email">
							<Label className="item-label">{shared.email}</Label>
							<TextInput
								className="auth-input"
								type="email"
								autoComplete="email"
								placeholder={shared.emailPlaceholder}
							/>
						</FormControl>

						<FormControl className="auth-field" name="password">
							<div className="auth-label-row">
								<Label className="item-label">{shared.password}</Label>
								<span className="auth-input-hint">{shared.minChars(PASSWORD_MIN_LENGTH)}</span>
							</div>
							<div className="auth-input-wrapper">
								<TextInput
									className="auth-input"
									type={showPassword ? 'text' : 'password'}
									autoComplete="new-password"
									placeholder="••••••••"
								/>
								<button
									type="button"
									className="auth-eye-btn"
									onClick={() => setShowPassword((v) => !v)}
									aria-label={showPassword ? shared.hidePassword : shared.showPassword}
								>
									{showPassword ? (
										<IconEyeOff size={24} stroke={1} />
									) : (
										<IconEye size={24} stroke={1} />
									)}
								</button>
							</div>
						</FormControl>

						<button
							className="auth-submit btn-primary btn-primary--auth"
							type="submit"
							disabled={isLoading}
						>
							{isLoading ? t.creating : shared.signUp}
							<IconArrowRight size={15} />
						</button>
					</Form>

					<p className="auth-switch">
						{t.haveAccount}{' '}
						<Link href="/login" className="auth-switch-link">
							{shared.logIn}
						</Link>
					</p>
				</div>
			</main>

			<Footer />
		</div>
	);
}
