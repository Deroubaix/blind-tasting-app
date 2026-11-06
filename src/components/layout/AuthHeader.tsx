import React from 'react';
import Link from 'next/link';
import Wordmark from './Wordmark';
import LanguageSwitch from '../../i18n/LanguageSwitch';

/** The site header's bar with only the wordmark and EN · PT: the auth pages link to each other in the page. */
export default function AuthHeader() {
	return (
		<header className="site-header">
			<Link href="/" className="site-header__logo">
				<Wordmark />
			</Link>
			<div className="site-header__right">
				<LanguageSwitch />
			</div>
		</header>
	);
}
