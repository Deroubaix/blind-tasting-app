import { pageTitle } from '../../i18n/server';
import TastingPageHeader from '../../components/layout/TastingPageHeader';
import FlightsListClient from '../../components/flights/FlightsListClient';

export const generateMetadata = pageTitle({ en: 'Flights', pt: 'Flights' });

export default function FlightsPage() {
	return (
		<div className="flight-page">
			<TastingPageHeader />
			<FlightsListClient />
		</div>
	);
}
