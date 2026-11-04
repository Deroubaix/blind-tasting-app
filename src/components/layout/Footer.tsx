import React from 'react';
import Link from 'next/link';
import Wordmark from './Wordmark';

export default function Footer() {
	return (
		<footer className="site-footer">
			<div className="site-footer__inner">
				<Link href="/" className="site-footer__logo no-underline" aria-label="Home">
					<Wordmark size="sm" />
				</Link>
				<nav className="site-footer__nav" aria-label="Footer">
					<Link href="/tastings/start">Start a tasting</Link>
					<Link href="/#flights">Flights</Link>
					<Link href="/flights/join">Join a flight</Link>
					<Link href="/login">Log in / Sign up</Link>
					<Link href="/privacy">Privacy</Link>
				</nav>
				<p className="site-footer__legal">
					Grid based on the 2024 Deductive Tasting Format, © Court of Master Sommeliers, Americas. Not
					affiliated with or endorsed by the Court of Master Sommeliers.
				</p>
			</div>
		</footer>
	);
}
