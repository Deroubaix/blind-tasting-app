'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IconPlus, IconUsersGroup } from '@tabler/icons-react';
import { type FlightListItem } from '../../types/Flight';
import { flightService, useRequireLogin } from './FlightBits';

export default function FlightsListClient() {
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
					<span className="flight-eyebrow">Study groups</span>
					<h1 className="flight-head__title">Flights</h1>
					<p className="flight-head__sub">
						One person pours numbered wines; everyone else tastes on their own phone. The host reveals each
						label once, and the group sees everyone&apos;s calls side by side.
					</p>
				</div>
			</header>

			<div className="flight-actions">
				<Link href="/flights/new" className="flight-action no-underline">
					<IconPlus size={22} aria-hidden="true" />
					<strong>Host a flight</strong>
					<span className="flight-muted">You pour and reveal; you get a code to share.</span>
				</Link>
				<Link href="/flights/join" className="flight-action no-underline">
					<IconUsersGroup size={22} aria-hidden="true" />
					<strong>Join a flight</strong>
					<span className="flight-muted">Enter the code from the host&apos;s screen.</span>
				</Link>
			</div>

			{error && <p className="archives-error">Your flights could not be loaded.</p>}
			{flights && flights.length > 0 && (
				<section aria-labelledby="your-flights">
					<h2 className="flight-eyebrow" id="your-flights">
						Your flights
					</h2>
					<ul className="flight-list">
						{flights.map((flight) => (
							<li key={flight.code} className="flight-list__row">
								<div className="flight-list__text">
									<span className="flight-list__title">{flight.name}</span>
									<span className="flight-muted">
										{flight.role === 'host' ? 'Hosted by you' : 'Tasting'} ·{' '}
										{new Date(flight.createdAt).toLocaleDateString('en-US', {
											month: 'long',
											day: 'numeric',
										})}{' '}
										· {flight.memberCount} tasters · {flight.revealed} of {flight.wineCount}{' '}
										revealed
										{flight.ended ? ' · Ended' : ''}
									</span>
								</div>
								<Link href={`/flights/${flight.code}`} className="flight-link no-underline">
									Open →
								</Link>
							</li>
						))}
					</ul>
				</section>
			)}
		</main>
	);
}
