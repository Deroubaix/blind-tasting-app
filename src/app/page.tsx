import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import HomeIntro from '../components/home/HomeIntro';
import HomeDashboard from '../components/home/HomeDashboard';
import ServerServices from '../services/server/ServerServices';
import SessionService from '../services/server/SessionService';
import TastingService from '../services/server/TastingService';
import FlightService from '../services/server/FlightService';
import UserService from '../services/server/UserService';
import { toProgressTasting } from '../utils/progressStats';
import { type TastingData } from '../types/TastingData';
import { homeText } from '../i18n/home';
import { archivesText } from '../i18n/archives';
import { getLang } from '../i18n/server';

export const dynamic = 'force-dynamic';

export default async function Homepage() {
	const lang = await getLang();
	const t = homeText[lang];
	const userId = await ServerServices.getClass(SessionService).currentUserId();

	if (!userId) {
		return (
			<>
				<Header />
				<main className="home">
					<HomeIntro t={t} status={archivesText[lang].scorecard.status} lang={lang} />
				</main>
				<Footer />
			</>
		);
	}

	const [user, tastings, flights] = await Promise.all([
		ServerServices.getClass(UserService).me(userId),
		ServerServices.getClass(TastingService).list(userId),
		ServerServices.getClass(FlightService).list(userId),
	]);
	// The stored JSON columns hold what the tasting flow saved, which is TastingData's shape.
	const list = tastings.map((tasting) =>
		toProgressTasting(
			{ ...(tasting as unknown as TastingData), id: tasting.id, created_at: tasting.created_at.toISOString() },
			lang,
		),
	);

	return (
		<>
			<Header />
			<main className="home">
				<HomeDashboard
					t={t}
					firstName={user?.displayName?.split(' ')[0] ?? ''}
					tastings={list}
					flights={flights}
					lang={lang}
				/>
			</main>
			<Footer />
		</>
	);
}
