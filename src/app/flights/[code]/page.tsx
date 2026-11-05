import { pageTitle } from '../../../i18n/server';
import TastingPageHeader from '../../../components/layout/TastingPageHeader';
import FlightPageClient from '../../../components/flights/FlightPageClient';

export const generateMetadata = pageTitle({ en: 'Flight', pt: 'Flight' });

export default async function FlightPage({ params }: { params: Promise<{ code: string }> }) {
	const { code } = await params;
	return (
		<div className="flight-page">
			<TastingPageHeader />
			<FlightPageClient code={code.toUpperCase()} />
		</div>
	);
}
