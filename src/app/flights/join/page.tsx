import { pageTitle } from '../../../i18n/server';
import TastingPageHeader from '../../../components/layout/TastingPageHeader';
import { JoinCodeClient } from '../../../components/flights/JoinFlight';

export const generateMetadata = pageTitle({ en: 'Join a Flight', pt: 'Entrar num flight' });

export default function JoinFlightPage() {
	return (
		<div className="flight-page">
			<TastingPageHeader cancelHref="/flights" />
			<JoinCodeClient />
		</div>
	);
}
