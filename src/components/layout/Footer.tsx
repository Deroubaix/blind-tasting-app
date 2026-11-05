'use client';

import React from 'react';
import Link from 'next/link';
import Wordmark from './Wordmark';
import LanguageSwitch from '../../i18n/LanguageSwitch';
import { commonText } from '../../i18n/common';
import { layoutText } from '../../i18n/layout';
import { useText } from '../../i18n/LanguageProvider';

// A client component: the auth forms, which are client components, render it too.
export default function Footer() {
	const t = useText(layoutText).footer;
	const c = useText(commonText);
	return (
		<footer className="site-footer">
			<div className="site-footer__inner">
				<Link href="/" className="site-footer__logo no-underline" aria-label={c.home}>
					<Wordmark size="sm" />
				</Link>
				<nav className="site-footer__nav" aria-label={t.navLabel}>
					<Link href="/tastings/start">{t.startTasting}</Link>
					<Link href="/#flights">{t.flights}</Link>
					<Link href="/flights/join">{t.joinFlight}</Link>
					<Link href="/login">{t.logInSignUp}</Link>
					<Link href="/privacy">{t.privacy}</Link>
					<LanguageSwitch />
				</nav>
				<p className="site-footer__legal">
					{c.grid.cms.credit} {c.grid.wset.credit} {c.notAffiliated}
				</p>
			</div>
		</footer>
	);
}
