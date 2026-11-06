'use client';

import React from 'react';
import Link from 'next/link';
import Wordmark from './Wordmark';
import LanguageSwitch from '../../i18n/LanguageSwitch';
import ThemeSwitch from '../../theme/ThemeSwitch';
import useAuthenticatedUser from '../../hooks/useAuthenticatedUser';
import { commonText } from '../../i18n/common';
import { layoutText } from '../../i18n/layout';
import { useText } from '../../i18n/LanguageProvider';

// A client component: the auth forms, which are client components, render it too.
export default function Footer() {
	const t = useText(layoutText).footer;
	const c = useText(commonText);
	const { user } = useAuthenticatedUser();
	const columns: [string, [string, string][]][] = [
		[
			t.taste,
			[
				['/tastings/start', t.startTasting],
				['/#solo', t.howSolo],
				['/#after', t.whatAfter],
			],
		],
		[
			t.flights,
			[
				['/flights/new', t.hostFlight],
				['/flights/join', t.haveCode],
				user ? ['/flights', t.yourFlights] : ['/#group', t.howFlights],
			],
		],
		[
			t.account,
			user
				? [
						['/archives', t.archive],
						['/progress', t.progress],
						['/account', t.account],
						['/privacy', t.privacy],
					]
				: [
						['/login', t.logIn],
						['/signup', t.signUp],
						['/privacy', t.privacy],
					],
		],
	];
	return (
		<footer className="site-footer">
			<div className="site-footer__inner page-container">
				<div className="site-footer__brand">
					<Link href="/" className="site-footer__logo" aria-label={c.home}>
						<Wordmark />
					</Link>
					<span>{t.tagline}</span>
				</div>
				{columns.map(([title, links]) => (
					<nav key={title} className="site-footer__col" aria-label={title}>
						<span className="site-footer__col-title" aria-hidden="true">
							{title}
						</span>
						{links.map(([href, label]) => (
							<Link key={href} href={href}>
								{label}
							</Link>
						))}
					</nav>
				))}
				<div className="site-footer__fine">
					<p className="site-footer__legal">
						{c.grid.cms.credit} {c.grid.wset.credit} {c.notAffiliated}
					</p>
					<LanguageSwitch />
					<ThemeSwitch />
				</div>
			</div>
		</footer>
	);
}
