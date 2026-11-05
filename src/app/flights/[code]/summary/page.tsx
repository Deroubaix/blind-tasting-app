import { pageTitle } from '../../../../i18n/server';
import TastingPageHeader from '../../../../components/layout/TastingPageHeader';
import FlightSummaryClient from '../../../../components/flights/FlightSummaryClient';

export const generateMetadata = pageTitle({ en: 'Flight Summary', pt: 'Resumo do flight' });

export default async function FlightSummaryPage({ params }: { params: Promise<{ code: string }> }) {
	const { code } = await params;
	return (
		<div className="flight-page">
			<TastingPageHeader />
			<FlightSummaryClient code={code.toUpperCase()} />
		</div>
	);
}
