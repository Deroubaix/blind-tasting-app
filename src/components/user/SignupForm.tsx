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
import { zodResolver } from '../../utils/FormUtils';
import { signupSchema, PASSWORD_MIN_LENGTH, type SignupFormType } from '../../schemas/auth';
import useLoadTracker from '../../hooks/useLoadTracker';
import useRedirectIfAuthenticated from '../../hooks/useRedirectIfAuthenticated';
import AuthHeader from '../layout/AuthHeader';
import Footer from '../layout/Footer';
import { useAuthProvider } from '../auth/AuthProvider';
import { isSavingTasting, safeRedirect } from '../../utils/AuthRedirectUtils';

export default function SignupForm() {
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const router = useRouter();
	const searchParams = useSearchParams();
	const { signUp, signIn } = useAuthProvider();
	const { showToast } = useToastProvider();
	const { isLoading, addLoader, removeLoader } = useLoadTracker();

	const redirectTo = safeRedirect(searchParams.get('r'));

	useRedirectIfAuthenticated(redirectTo);

	const form = useForm<SignupFormType>({
		initialValues: { displayName: '', email: '', password: '' },
		validate: zodResolver(signupSchema),
	});

	const handleSubmit = async (values: SignupFormType) => {
		const loader = addLoader();
		setError(null);

		try {
			await signUp(values.displayName, values.email, values.password);
			await signIn(values.email, values.password);

			showToast({ title: 'Welcome to the Ledger', children: 'Your account is ready.', color: 'success' });
			router.push(redirectTo);
		} catch (err) {
			const isSyntaxError = err instanceof SyntaxError;
			const apiError = isSyntaxError
				? JsonApiError.create(
						new Error('Signup failed: the server returned an unexpected response. Please try again.'),
					)
				: JsonApiError.create(err);

			// Shown on the form only, as on login.
			setError(apiError.message || 'Failed to sign up');
		} finally {
			removeLoader(loader);
		}
	};

	return (
		<div className="auth-page">
			<AuthHeader
				contextLink={{
					href: '/login',
					label: 'Log in',
					contextLabel: 'Already a member?',
				}}
			/>

			<main className="auth-main">
				<div className="auth-container">
					<header className="auth-card-head">
						<span className="page-eyebrow">Create account</span>
						<h1>
							Begin your <em>ledger</em>.
						</h1>
						{isSavingTasting(redirectTo) ? (
							<p className="auth-subheading">
								<strong>Your tasting is waiting.</strong> Create an account and it will be saved
								straight away.
							</p>
						) : (
							<p className="auth-subheading">
								<strong>Three fields, thirty seconds.</strong> Save your sessions to review later.
							</p>
						)}
					</header>

					<Form className="auth-form" form={form} onSubmit={handleSubmit} disabled={isLoading}>
						{error && <p className="auth-error">{error}</p>}

						<FormControl className="auth-field" name="displayName">
							<Label className="item-label">Display Name</Label>
							<TextInput
								className="auth-input"
								type="text"
								autoComplete="name"
								placeholder="First name first, e.g. Marisha D."
							/>
						</FormControl>

						<FormControl className="auth-field" name="email">
							<Label className="item-label">Email Address</Label>
							<TextInput
								className="auth-input"
								type="email"
								autoComplete="email"
								placeholder="cellar@master.edu"
							/>
						</FormControl>

						<FormControl className="auth-field" name="password">
							<div className="auth-label-row">
								<Label className="item-label">Password</Label>
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
							{isLoading ? 'Creating account…' : 'Sign up'}
							<IconArrowRight size={15} />
						</button>
					</Form>

					<p className="auth-switch">
						Already have an account?{' '}
						<Link href="/login" className="auth-switch-link">
							Log in
						</Link>
					</p>
				</div>
			</main>

			<Footer />
		</div>
	);
}
