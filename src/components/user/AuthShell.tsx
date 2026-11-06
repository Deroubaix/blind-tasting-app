import React from 'react';
import AuthHeader from '../layout/AuthHeader';
import Footer from '../layout/Footer';

/** The frame every auth page shares: the header bar, one narrow column, the footer. */
export default function AuthShell({ children }: { children: React.ReactNode }) {
	return (
		<div className="auth-page">
			<AuthHeader />
			<main className="auth-main">
				<div className="auth-container">{children}</div>
			</main>
			<Footer />
		</div>
	);
}
