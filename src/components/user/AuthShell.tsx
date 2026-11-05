import React from 'react';
import AuthHeader, { type AuthHeaderProps } from '../layout/AuthHeader';
import Footer from '../layout/Footer';

/** The frame every auth page shares: the header bar, one centred column, the footer. */
export default function AuthShell({ contextLink, children }: AuthHeaderProps & { children: React.ReactNode }) {
	return (
		<div className="auth-page">
			<AuthHeader contextLink={contextLink} />
			<main className="auth-main">
				<div className="auth-container">{children}</div>
			</main>
			<Footer />
		</div>
	);
}
