import '../styles/main.scss';
import React, { type ReactNode } from 'react';
import type { Metadata } from 'next';
import { Manrope, Lora } from 'next/font/google';
import { BRAND } from '../data/brand';
import { AuthProvider } from '../components/auth/AuthProvider';
import ToastProvider from '../toast/ToastProvider';
import ModalProvider from '../components/modal/ModalProvider';
import { TastingProvider } from '../components/tasting/TastingContext';
import { LanguageProvider } from '../i18n/LanguageProvider';
import { layoutText } from '../i18n/layout';
import { LOCALES } from '../i18n';
import { getLang } from '../i18n/server';

export const dynamic = 'force-dynamic';

const manrope = Manrope({
	subsets: ['latin'],
	variable: '--font-manrope',
	weight: ['400', '500', '600', '700', '800'],
	display: 'swap',
});

const lora = Lora({
	subsets: ['latin'],
	variable: '--font-lora',
	style: ['normal', 'italic'],
	display: 'swap',
});

// One name everywhere. Pages set only their own part of the title; the template adds the rest.
export async function generateMetadata(): Promise<Metadata> {
	const lang = await getLang();
	return {
		title: { default: BRAND.name, template: `%s — ${BRAND.name}` },
		description: layoutText[lang].meta.description,
	};
}

export type RootLayoutProps = {
	children: ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
	const lang = await getLang();
	return (
		<html lang={LOCALES[lang]} className={`${manrope.variable} ${lora.variable}`}>
			<head>
				<meta charSet="utf-8" />
				<link rel="icon" href="/favicon.ico" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta name="theme-color" content="#141313" />
			</head>
			<body>
				<LanguageProvider lang={lang}>
					<AuthProvider>
						<ToastProvider>
							<ModalProvider>
								<TastingProvider>{children}</TastingProvider>
							</ModalProvider>
						</ToastProvider>
					</AuthProvider>
				</LanguageProvider>
			</body>
		</html>
	);
}
