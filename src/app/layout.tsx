import '../styles/main.scss';
import React, { type ReactNode } from 'react';
import type { Metadata } from 'next';
import { Newsreader, Source_Sans_3 } from 'next/font/google';
import { BRAND } from '../data/brand';
import { AuthProvider } from '../components/auth/AuthProvider';
import ToastProvider from '../components/toast/ToastProvider';
import ModalProvider from '../components/modal/ModalProvider';
import { TastingProvider } from '../components/tasting/TastingContext';
import { LanguageProvider } from '../i18n/LanguageProvider';
import { layoutText } from '../i18n/layout';
import { LOCALES } from '../i18n';
import { getLang } from '../i18n/server';
import { getTheme } from '../theme/server';
import { ThemeProvider } from '../theme/ThemeProvider';

export const dynamic = 'force-dynamic';

const sourceSans = Source_Sans_3({
	subsets: ['latin'],
	variable: '--font-source-sans',
	weight: ['400', '600'],
	style: ['normal', 'italic'],
	display: 'swap',
});

const newsreader = Newsreader({
	subsets: ['latin'],
	variable: '--font-newsreader',
	weight: ['400', '500', '600'],
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
	const theme = await getTheme();
	return (
		<html lang={LOCALES[lang]} data-theme={theme} className={`${sourceSans.variable} ${newsreader.variable}`}>
			<head>
				<meta charSet="utf-8" />
				<link rel="icon" href="/favicon.ico" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
			</head>
			<body>
				<LanguageProvider lang={lang}>
					<ThemeProvider theme={theme}>
						<AuthProvider>
							<ToastProvider>
								<ModalProvider>
									<TastingProvider>{children}</TastingProvider>
								</ModalProvider>
							</ToastProvider>
						</AuthProvider>
					</ThemeProvider>
				</LanguageProvider>
			</body>
		</html>
	);
}
