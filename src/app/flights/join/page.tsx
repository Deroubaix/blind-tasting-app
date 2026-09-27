import { type Metadata } from 'next';
import TastingPageHeader from '../../../components/layout/TastingPageHeader';
import { JoinCodeClient } from '../../../components/flights/JoinFlight';

export const metadata: Metadata = { title: 'Join a Flight' };

export default function JoinFlightPage() {
	return (
		<div className="flight-page">
			<TastingPageHeader cancelHref="/flights" />
			<JoinCodeClient />
		</div>
	);
}
