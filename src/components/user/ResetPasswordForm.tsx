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
import { zodResolver } from '../../utils/FormUtils';
import { resetPasswordSchema, PASSWORD_MIN_LENGTH, type ResetPasswordFormType } from '../../schemas/auth';
import useLoadTracker from '../../hooks/useLoadTracker';
import useRedirectIfAuthenticated from '../../hooks/useRedirectIfAuthenticated';
import AuthHeader from '../layout/AuthHeader';
import Footer from '../layout/Footer';
import { useAuthProvider } from '../auth/AuthProvider';

export default function ResetPasswordForm() {
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState<ReactNode | null>(null);

	const router = useRouter();
	const searchParams = useSearchParams();
	const { completePasswordReset, signIn } = useAuthProvider();
	const { isLoading, addLoader, removeLoader } = useLoadTracker();

	const token = searchParams.get('token') ?? '';
	const email = searchParams.get('email') ?? '';
	const isInvalidLink = !token || !email;

	useRedirectIfAuthenticated();

	const form = useForm<ResetPasswordFormType>({
		initialValues: { password: '', confirmPassword: '' },
		validate: zodResolver(resetPasswordSchema),
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
						This reset link is invalid or has expired. Please request a new one from the{' '}
						<Link href="/forgot-password">Forgot password</Link> page.
					</>,
				);
			} else {
				setError(apiError.message || 'Something went wrong. Please try again.');
			}
		} finally {
			removeLoader(loader);
		}
	};

	if (isInvalidLink) {
		return (
			<div className="auth-page">
				<AuthHeader contextLink={{ href: '/login', label: 'Log in', contextLabel: 'Go back?' }} />
				<main className="auth-main">
					<div className="auth-container">
						<header className="auth-card-head">
							<span className="page-eyebrow">Invalid link</span>
							<h1 className="auth-heading">
								Link <em>expired</em>.
							</h1>
							<p className="auth-subheading">
								This reset link is missing required information. Please request a new one.
							</p>
						</header>
						<p className="auth-switch">
							<Link href="/forgot-password" className="auth-switch-link">
								Request new link
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
			<AuthHeader contextLink={{ href: '/login', label: 'Log in', contextLabel: 'Remember it?' }} />

			<main className="auth-main">
				<div className="auth-container">
					<header className="auth-card-head">
						<span className="page-eyebrow">New password</span>
						<h1 className="auth-heading">
							Choose a new <em>key</em>.
						</h1>
						<p className="auth-subheading">
							Pick a strong password — at least {PASSWORD_MIN_LENGTH} characters.
						</p>
					</header>

					<Form className="auth-form" form={form} onSubmit={handleSubmit} disabled={isLoading}>
						{error && <p className="auth-error">{error}</p>}

						<FormControl className="auth-field" name="password">
							<div className="auth-label-row">
								<Label className="auth-label">New Password</Label>
								<span className="auth-input-hint">{PASSWORD_MIN_LENGTH}+ characters</span>
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
									aria-label={showPassword ? 'Hide password' : 'Show password'}
								>
									{showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
								</button>
							</div>
						</FormControl>

						<FormControl className="auth-field" name="confirmPassword">
							<Label className="auth-label">Confirm Password</Label>
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
							{isLoading ? 'Saving…' : 'Set new password'}
							<IconArrowRight size={15} />
						</button>
					</Form>
				</div>
			</main>

			<Footer />
		</div>
	);
}
