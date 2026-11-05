'use client';

import Link from 'next/link';
import { FlightMessage, useFlight, useRequireLogin } from './FlightBits';
import HostDashboard from './HostDashboard';
import TasterFlight from './TasterFlight';
import { JoinInvite } from './JoinFlight';
import { flightsText } from '../../i18n/flights';
import { commonText } from '../../i18n/common';
import { useText } from '../../i18n/LanguageProvider';

/** One address per flight: the host's dashboard, a taster's wine list, or the invitation to join. */
export default function FlightPageClient({ code }: { code: string }) {
	const t = useText(flightsText).page;
	const common = useText(commonText);
	const ready = useRequireLogin(`/flights/${code}`);
	const { flight, error, reload } = useFlight(code, ready);

	if (error && !flight) {
		return (
			<FlightMessage>
				<p>{error}</p>
				<Link href="/flights" className="text-link text-link--sm">
					{t.backToFlights}
				</Link>
			</FlightMessage>
		);
	}
	if (!flight) {
		return <div className="empty-state">{common.loading}</div>;
	}
	if (flight.role === 'host') {
		return <HostDashboard flight={flight} reload={reload} />;
	}
	if (flight.role === 'taster') {
		return <TasterFlight flight={flight} reload={reload} />;
	}
	return <JoinInvite flight={flight} onJoined={reload} />;
}
