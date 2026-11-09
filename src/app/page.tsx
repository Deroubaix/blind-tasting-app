import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import HomeIntro from '../components/home/HomeIntro';
import HomeDashboard, { RECENT_COUNT } from '../components/home/HomeDashboard';
import ServerServices from '../services/server/ServerServices';
import SessionService from '../services/server/SessionService';
import TastingService from '../services/server/TastingService';
import FlightService from '../services/server/FlightService';
import UserService from '../services/server/UserService';
import ProgressService from '../services/server/ProgressService';
import { toProgressTasting } from '../utils/progressStats';
import { tastingRow } from '../utils/tastingRow';
import { isRevealed } from '../utils/revealScore';
import { type TastingData } from '../types/TastingData';
import { homeText } from '../i18n/home';
import { archivesText } from '../i18n/archives';
import { getLang } from '../i18n/server';

export const dynamic = 'force-dynamic';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const inPastWeek = (date: Date) => Date.now() - date.getTime() < WEEK_MS;

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

	const [user, tastings, flights, palate] = await Promise.all([
		ServerServices.getClass(UserService).me(userId),
		ServerServices.getClass(TastingService).list(userId),
		ServerServices.getClass(FlightService).list(userId),
		ServerServices.getClass(ProgressService).palateSamples(userId),
	]);
	// The stored JSON columns hold what the tasting flow saved, which is TastingData's shape.
	const saved = tastings.map((tasting) => ({
		...(tasting as unknown as TastingData),
		id: tasting.id,
		created_at: tasting.created_at.toISOString(),
	}));
	const list = saved.map((tasting) => toProgressTasting(tasting, lang));
	const recent = saved.slice(0, RECENT_COUNT).map((tasting) => ({
		id: tasting.id,
		date: tasting.created_at,
		wineType: tasting.wineType,
		inFlight: !!tasting.flight,
		...tastingRow(tasting, lang),
	}));

	return (
		<>
			<Header />
			<main className="home">
				<HomeDashboard
					t={t}
					firstName={user?.displayName?.split(' ')[0] ?? ''}
					tastings={list}
					recent={recent}
					counts={{
						week: tastings.filter((tasting) => inPastWeek(tasting.created_at)).length,
						waiting: saved.filter((tasting) => !isRevealed(tasting.reveal)).length,
					}}
					flights={flights}
					palate={palate}
					lang={lang}
				/>
			</main>
			<Footer />
		</>
	);
}
