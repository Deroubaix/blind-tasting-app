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
import { zodResolver } from '../../utils/FormUtils';
import { forgotPasswordSchema, type ForgotPasswordFormType } from '../../schemas/auth';
import useLoadTracker from '../../hooks/useLoadTracker';
import useRedirectIfAuthenticated from '../../hooks/useRedirectIfAuthenticated';
import AuthHeader from '../layout/AuthHeader';
import Footer from '../layout/Footer';
import { useAuthProvider } from '../auth/AuthProvider';

export default function ForgotPasswordForm() {
	const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const { requestPasswordReset } = useAuthProvider();
	const { isLoading, addLoader, removeLoader } = useLoadTracker();

	useRedirectIfAuthenticated();

	const form = useForm<ForgotPasswordFormType>({
		initialValues: { email: '' },
		validate: zodResolver(forgotPasswordSchema),
	});

	const handleSubmit = async (values: ForgotPasswordFormType) => {
		const loader = addLoader();
		setError(null);

		try {
			await requestPasswordReset(values.email);
			setSubmittedEmail(values.email);
		} catch (err) {
			setError(JsonApiError.create(err).message || 'Something went wrong. Please try again.');
		} finally {
			removeLoader(loader);
		}
	};

	return (
		<div className="auth-page">
			<AuthHeader contextLink={{ href: '/login', label: 'Log in', contextLabel: 'Remember it?' }} />

			<main className="auth-main">
				<div className="auth-container">
					{submittedEmail ? (
						<>
							<header className="auth-card-head">
								<span className="page-eyebrow">Check your inbox</span>
								<h1 className="auth-heading">
									Email <em>sent</em>.
								</h1>
								<p className="auth-subheading">
									If <strong>{submittedEmail}</strong> has an account, you&apos;ll receive a reset
									link within a minute. Check your spam folder if it doesn&apos;t arrive.
								</p>
							</header>

							<div className="auth-success-icon">
								<IconCheck size={20} strokeWidth={2.5} />
							</div>

							<p className="auth-switch">
								<Link href="/login" className="auth-switch-link">
									Back to log in
								</Link>
							</p>
						</>
					) : (
						<>
							<header className="auth-card-head">
								<span className="page-eyebrow">Forgot password</span>
								<h1 className="auth-heading">
									Reset your <em>access</em>.
								</h1>
								<p className="auth-subheading">
									Enter your email and we&apos;ll send you a link to choose a new password.
								</p>
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

								<button
									className="auth-submit btn-primary btn-primary--auth"
									type="submit"
									disabled={isLoading}
								>
									{isLoading ? 'Sending…' : 'Send reset link'}
									<IconArrowRight size={15} />
								</button>
							</Form>

							<p className="auth-switch">
								<Link href="/login" className="auth-switch-link">
									Back to log in
								</Link>
							</p>
						</>
					)}
				</div>
			</main>

			<Footer />
		</div>
	);
}
