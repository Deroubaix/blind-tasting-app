import React from 'react';
import Link from 'next/link';

export default function Footer() {
	return (
		<footer className="site-footer">
			<div className="footer-main">
				<div className="footer-brand">
					<Link href="/" className="footer-logo no-underline">
						The Sommelier&apos;s Ledger
					</Link>
					<p className="footer-tagline">
						The personal practice ledger for Court of Master Sommeliers deductive tasting candidates.
					</p>
				</div>

				<div className="footer-links">
					<div className="footer-col">
						<h4>Tools</h4>
						<Link href="/archives">Archive</Link>
						<Link href="/flights">Flights</Link>
						<Link href="/login">Log in</Link>
					</div>
					<div className="footer-col">
						<h4>Your data</h4>
						<Link href="/account">Account</Link>
						<Link href="/privacy">Privacy</Link>
					</div>
				</div>
			</div>

			<div className="footer-bottom">
				<span>© {new Date().getFullYear()} The Sommelier&apos;s Ledger.</span>
				<span>
					Grid based on the 2024 Deductive Tasting Format, © Court of Master Sommeliers, Americas. Not
					affiliated with or endorsed by the Court of Master Sommeliers.
				</span>
			</div>
		</footer>
	);
}
