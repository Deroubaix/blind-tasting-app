'use client';

import React, { type ReactNode, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from '@mantine/form';
import { IconArrowRight, IconEye, IconEyeOff } from '@tabler/icons-react';
import Form from '../form/Form';
import FormControl from '../form/FormControl';
import Label from '../form/Label';
import TextInput from '../form/TextInput';
import { JsonApiError } from '../../utils/ErrorUtils';
import { resetPasswordSchema, PASSWORD_MIN_LENGTH, type ResetPasswordFormType } from '../../schemas/auth';
import useLoadTracker from '../../hooks/useLoadTracker';
import useRedirectIfAuthenticated from '../../hooks/useRedirectIfAuthenticated';
import AuthHeader from '../layout/AuthHeader';
import Footer from '../layout/Footer';
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
			router.push('/archives');
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
			<div className="auth-page">
				<AuthHeader contextLink={{ href: '/login', label: shared.logIn, contextLabel: t.goBack }} />
				<main className="auth-main">
					<div className="auth-container">
						<header className="auth-card-head">
							<span className="page-eyebrow">{t.invalidEyebrow}</span>
							<h1>
								{t.invalidBefore}
								<em>{t.invalidEm}</em>
								{t.invalidAfter}
							</h1>
							<p className="auth-subheading">{t.invalidSubheading}</p>
						</header>
						<p className="auth-switch">
							<Link href="/forgot-password" className="auth-switch-link">
								{t.requestNew}
							</Link>
						</p>
					</div>
				</main>
				<Footer />
			</div>
		);
	}

	return (
		<div className="auth-page">
			<AuthHeader contextLink={{ href: '/login', label: shared.logIn, contextLabel: shared.rememberIt }} />

			<main className="auth-main">
				<div className="auth-container">
					<header className="auth-card-head">
						<span className="page-eyebrow">{t.eyebrow}</span>
						<h1>
							{t.headingBefore}
							<em>{t.headingEm}</em>
							{t.headingAfter}
						</h1>
						<p className="auth-subheading">{t.subheading(PASSWORD_MIN_LENGTH)}</p>
					</header>

					<Form className="auth-form" form={form} onSubmit={handleSubmit} disabled={isLoading}>
						{error && <p className="auth-error">{error}</p>}

						<FormControl className="auth-field" name="password">
							<div className="auth-label-row">
								<Label className="item-label">{t.newPassword}</Label>
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
									{showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
								</button>
							</div>
						</FormControl>

						<FormControl className="auth-field" name="confirmPassword">
							<Label className="item-label">{t.confirmPassword}</Label>
							<TextInput
								className="auth-input"
								type={showPassword ? 'text' : 'password'}
								autoComplete="new-password"
								placeholder="••••••••"
							/>
						</FormControl>

						<button
							className="auth-submit btn-primary btn-primary--auth"
							type="submit"
							disabled={isLoading}
						>
							{isLoading ? t.saving : t.submit}
							<IconArrowRight size={15} />
						</button>
					</Form>
				</div>
			</main>

			<Footer />
		</div>
	);
}
