import { pageTitle } from '../../../i18n/server';
import TastingPageHeader from '../../../components/layout/TastingPageHeader';
import FlightCreateClient from '../../../components/flights/FlightCreateClient';

export const generateMetadata = pageTitle({ en: 'Host a Flight', pt: 'Organizar um flight' });

export default function NewFlightPage() {
	return (
		<div className="flight-page">
			<TastingPageHeader cancelHref="/flights" />
			<FlightCreateClient />
		</div>
	);
}
