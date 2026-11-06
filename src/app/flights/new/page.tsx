import { pageTitle } from '../../../i18n/server';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import FlightCreateClient from '../../../components/flights/FlightCreateClient';

export const generateMetadata = pageTitle({ en: 'Host a Flight', pt: 'Organizar um flight' });

export default function NewFlightPage() {
	return (
		<div className="site-page">
			<Header />
			<FlightCreateClient />
			<Footer />
		</div>
	);
}
