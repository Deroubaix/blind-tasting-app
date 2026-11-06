import { pageTitle } from '../../i18n/server';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import FlightsListClient from '../../components/flights/FlightsListClient';

export const generateMetadata = pageTitle({ en: 'Flights', pt: 'Flights' });

export default function FlightsPage() {
	return (
		<div className="site-page">
			<Header />
			<FlightsListClient />
			<Footer />
		</div>
	);
}
