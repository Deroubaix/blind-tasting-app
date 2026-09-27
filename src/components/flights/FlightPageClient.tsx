'use client';

import Link from 'next/link';
import { FlightMessage, useFlight, useRequireLogin } from './FlightBits';
import HostDashboard from './HostDashboard';
import TasterFlight from './TasterFlight';
import { JoinInvite } from './JoinFlight';

/** One address per flight: the host's dashboard, a taster's wine list, or the invitation to join. */
export default function FlightPageClient({ code }: { code: string }) {
	const ready = useRequireLogin(`/flights/${code}`);
	const { flight, error, reload } = useFlight(code, ready);

	if (error && !flight) {
		return (
			<FlightMessage>
				<p>{error}</p>
				<Link href="/flights" className="flight-link">
					← Your flights
				</Link>
			</FlightMessage>
		);
	}
	if (!flight) {
		return <div className="archives-loading">Loading…</div>;
	}
	if (flight.role === 'host') {
		return <HostDashboard flight={flight} reload={reload} />;
	}
	if (flight.role === 'taster') {
		return <TasterFlight flight={flight} reload={reload} />;
	}
	return <JoinInvite flight={flight} onJoined={reload} />;
}
