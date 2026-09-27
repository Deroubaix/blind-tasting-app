import { type Metadata } from 'next';
import TastingPageHeader from '../../../../components/layout/TastingPageHeader';
import FlightSummaryClient from '../../../../components/flights/FlightSummaryClient';

export const metadata: Metadata = { title: 'Flight Summary' };

export default async function FlightSummaryPage({ params }: { params: Promise<{ code: string }> }) {
	const { code } = await params;
	return (
		<div className="flight-page">
			<TastingPageHeader />
			<FlightSummaryClient code={code.toUpperCase()} />
		</div>
	);
}
