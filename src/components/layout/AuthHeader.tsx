import React from 'react';
import Link from 'next/link';
import { IconArrowRight } from '@tabler/icons-react';
import Wordmark from './Wordmark';

export type AuthHeaderProps = {
	contextLink: { href: string; label: string; contextLabel: string };
};

/** The site header's bar with only the wordmark and the one link an auth page needs. */
export default function AuthHeader({ contextLink }: AuthHeaderProps) {
	return (
		<header className="site-header">
			<Link href="/" className="site-header__logo">
				<Wordmark />
			</Link>
			<Link href={contextLink.href} className="site-header__context">
				<span className="site-header__context-label">{contextLink.contextLabel}</span>
				<span className="site-header__context-action">{contextLink.label}</span>
				<span className="site-header__context-arrow">
					<IconArrowRight size={12} />
				</span>
			</Link>
		</header>
	);
}
