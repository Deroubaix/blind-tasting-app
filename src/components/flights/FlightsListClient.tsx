'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IconPlus, IconUsersGroup } from '@tabler/icons-react';
import { type FlightListItem } from '../../types/Flight';
import { flightService, useRequireLogin } from './FlightBits';
import { formatDate } from '../../utils/DateUtils';
import { flightsText } from '../../i18n/flights';
import { useLang, useText } from '../../i18n/LanguageProvider';

export default function FlightsListClient() {
	const { lang } = useLang();
	const text = useText(flightsText);
	const t = text.list;
	const ready = useRequireLogin('/flights');
	const [flights, setFlights] = useState<FlightListItem[] | null>(null);
	const [error, setError] = useState(false);

	useEffect(() => {
		if (ready) {
			flightService
				.list()
				.then(setFlights)
				.catch(() => setError(true));
		}
	}, [ready]);

	return (
		<main className="flight-main">
			<header className="flight-head">
				<div className="flight-head__text">
					<h1>{t.title}</h1>
					<p className="flight-head__sub">{t.sub}</p>
				</div>
			</header>

			<div className="flight-actions">
				<Link href="/flights/new" className="flight-action">
					<IconPlus size={22} aria-hidden="true" />
					<strong>{t.host}</strong>
					<span className="flight-muted">{t.hostNote}</span>
				</Link>
				<Link href="/flights/join" className="flight-action">
					<IconUsersGroup size={22} aria-hidden="true" />
					<strong>{t.join}</strong>
					<span className="flight-muted">{t.joinNote}</span>
				</Link>
			</div>

			{error && <p className="empty-state">{t.loadFailed}</p>}
			{flights && flights.length > 0 && (
				<section aria-labelledby="your-flights">
					<h2 className="flight-section-label" id="your-flights">
						{t.yours}
					</h2>
					<ul className="flight-rows">
						{flights.map((flight) => (
							<li key={flight.code}>
								<Link href={`/flights/${flight.code}`} className="flight-row">
									<strong>{flight.name}</strong>
									<span className="flight-row__end">{flight.ended ? text.bits.ended : t.open}</span>
									<span className="flight-row__meta">
										{flight.role === 'host' ? t.hostedByYou : t.joined} ·{' '}
										{formatDate(flight.createdAt, lang)} · {text.bits.tasters(flight.memberCount)} ·{' '}
										{text.bits.revealedOf(flight.revealed, flight.wineCount)}
									</span>
								</Link>
							</li>
						))}
					</ul>
				</section>
			)}
		</main>
	);
}
