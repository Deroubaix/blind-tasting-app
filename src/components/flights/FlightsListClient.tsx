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
				<div>
					<span className="page-eyebrow">{t.eyebrow}</span>
					<h1 className="flight-head__title">{t.title}</h1>
					<p className="flight-head__sub">{t.sub}</p>
				</div>
			</header>

			<div className="flight-actions">
				<Link href="/flights/new" className="flight-action no-underline">
					<IconPlus size={22} aria-hidden="true" />
					<strong>{t.host}</strong>
					<span className="flight-muted">{t.hostNote}</span>
				</Link>
				<Link href="/flights/join" className="flight-action no-underline">
					<IconUsersGroup size={22} aria-hidden="true" />
					<strong>{t.join}</strong>
					<span className="flight-muted">{t.joinNote}</span>
				</Link>
			</div>

			{error && <p className="archives-error">{t.loadFailed}</p>}
			{flights && flights.length > 0 && (
				<section aria-labelledby="your-flights">
					<h2 className="tasting-card__label" id="your-flights">
						{t.yours}
					</h2>
					<ul className="flight-list">
						{flights.map((flight) => (
							<li key={flight.code} className="flight-list__row">
								<div className="flight-list__text">
									<span className="flight-list__title">{flight.name}</span>
									<span className="flight-muted">
										{flight.role === 'host' ? t.hostedByYou : t.joined} ·{' '}
										{formatDate(flight.createdAt, lang)} · {text.bits.tasters(flight.memberCount)} ·{' '}
										{text.bits.revealedOf(flight.revealed, flight.wineCount)}
										{flight.ended ? ` · ${text.bits.ended}` : ''}
									</span>
								</div>
								<Link href={`/flights/${flight.code}`} className="flight-link no-underline">
									{t.open}
								</Link>
							</li>
						))}
					</ul>
				</section>
			)}
		</main>
	);
}
