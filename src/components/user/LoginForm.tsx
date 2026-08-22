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
import NotificationUtils from '../../utils/NotificationsUtils';
import { JsonApiError } from '../../utils/ErrorUtils';
import { zodResolver } from '../../utils/FormUtils';
import { loginSchema, type LoginFormType } from '../../schemas/auth';
import useLoadTracker from '../../hooks/useLoadTracker';
import useRedirectIfAuthenticated from '../../hooks/useRedirectIfAuthenticated';
import AuthHeader from '../layout/AuthHeader';
import Footer from '../layout/Footer';
import { useAuthProvider } from '../auth/AuthProvider';

export default function LoginForm() {
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const router = useRouter();
	const searchParams = useSearchParams();
	const { signIn } = useAuthProvider();
	const { isLoading, addLoader, removeLoader } = useLoadTracker();

	const redirectTo = searchParams.get('r') ?? '/archives';
	const signupHref = `/signup?r=${encodeURIComponent(redirectTo)}`;

	useRedirectIfAuthenticated(redirectTo);

	const form = useForm<LoginFormType>({
		initialValues: { email: '', password: '' },
		validate: zodResolver(loginSchema),
	});

	const handleSubmit = async (values: LoginFormType) => {
		const loader = addLoader();
		setError(null);

		try {
			await signIn(values.email, values.password);
			NotificationUtils.showSuccess('Login successful', 'Welcome back');
			router.push(redirectTo);
		} catch (err) {
			const apiError = JsonApiError.create(err);
			const message = apiError.statusCode === 401 ? 'Incorrect email and/or password.' : apiError.message;

			setError(message);
			NotificationUtils.showError(apiError, 'Login Failed');
		} finally {
			removeLoader(loader);
		}
	};

	return (
		<div className="auth-page">
			<AuthHeader
				contextLink={{
					href: signupHref,
					label: 'Sign up',
					contextLabel: 'New here?',
				}}
			/>

			<main className="auth-main">
				<div className="auth-container">
					<header className="auth-card-head">
						<span className="page-eyebrow">Welcome back</span>
						<h1 className="auth-heading">
							Open the <em>ledger</em>.
						</h1>
						<p className="auth-subheading">Log in to access your saved tastings.</p>
					</header>

					<Form className="auth-form" form={form} onSubmit={handleSubmit} disabled={isLoading}>
						{error && <p className="auth-error">{error}</p>}

						<FormControl className="auth-field" name="email">
							<Label className="auth-label">Email Address</Label>
							<TextInput
								className="auth-input"
								type="email"
								autoComplete="email"
								placeholder="cellar@master.edu"
							/>
						</FormControl>

						<FormControl className="auth-field" name="password">
							<div className="auth-label-row">
								<Label className="auth-label">Password</Label>
								<Link href="/forgot-password" className="auth-forgot">
									Forgot?
								</Link>
							</div>
							<div className="auth-input-wrapper">
								<TextInput
									className="auth-input"
									type={showPassword ? 'text' : 'password'}
									autoComplete="current-password"
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
							{isLoading ? 'Logging in…' : 'Log in'}
							<IconArrowRight size={15} />
						</button>
					</Form>

					<p className="auth-switch">
						New to the Ledger?{' '}
						<Link href={signupHref} className="auth-switch-link">
							Sign up
						</Link>
					</p>
				</div>
			</main>

			<Footer />
		</div>
	);
}
