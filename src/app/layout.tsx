import '../styles/main.scss';
import React, { type ReactNode } from 'react';
import type { Metadata } from 'next';
import { Manrope, Lora } from 'next/font/google';
import { AuthProvider } from '../components/auth/AuthProvider';
import ToastProvider from '../toast/ToastProvider';
import ModalProvider from '../components/modal/ModalProvider';
import { TastingProvider } from '../components/tasting/TastingContext';

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

export const metadata: Metadata = {
	title: 'Blind Tasting App',
};

export type RootLayoutProps = {
	children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
	return (
		<html lang="en" className={`${manrope.variable} ${lora.variable}`}>
			<head>
				<meta charSet="utf-8" />
				<link rel="icon" href="/favicon.ico" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta name="theme-color" content="#000000" />
				<meta name="description" content="A fun app for wine enthusiasts!" />
			</head>
			<body>
				<AuthProvider>
					<ToastProvider>
						<ModalProvider>
							<TastingProvider>{children}</TastingProvider>
						</ModalProvider>
					</ToastProvider>
				</AuthProvider>
			</body>
		</html>
	);
}
