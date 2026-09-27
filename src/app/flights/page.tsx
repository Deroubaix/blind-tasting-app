import { type Metadata } from 'next';
import TastingPageHeader from '../../components/layout/TastingPageHeader';
import FlightsListClient from '../../components/flights/FlightsListClient';

export const metadata: Metadata = { title: 'Flights' };

export default function FlightsPage() {
	return (
		<div className="flight-page">
			<TastingPageHeader />
			<FlightsListClient />
		</div>
	);
}
