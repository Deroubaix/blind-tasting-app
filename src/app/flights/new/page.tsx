import { type Metadata } from 'next';
import TastingPageHeader from '../../../components/layout/TastingPageHeader';
import FlightCreateClient from '../../../components/flights/FlightCreateClient';

export const metadata: Metadata = { title: 'Host a Flight' };

export default function NewFlightPage() {
	return (
		<div className="flight-page">
			<TastingPageHeader cancelHref="/flights" />
			<FlightCreateClient />
		</div>
	);
}
