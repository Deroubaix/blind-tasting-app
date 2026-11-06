import { pageTitle } from '../../../i18n/server';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import { JoinCodeClient } from '../../../components/flights/JoinFlight';

export const generateMetadata = pageTitle({ en: 'Join a Flight', pt: 'Entrar num flight' });

export default function JoinFlightPage() {
	return (
		<div className="site-page">
			<Header />
			<JoinCodeClient />
			<Footer />
		</div>
	);
}
