import React from 'react';
import Link from 'next/link';
import Wordmark from './Wordmark';
import { GRIDS } from '../../data/grids';

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
					{GRIDS.cms.credit} {GRIDS.wset.credit} Not affiliated with or endorsed by the Court of Master
					Sommeliers or the Wine &amp; Spirit Education Trust.
				</p>
			</div>
		</footer>
	);
}
