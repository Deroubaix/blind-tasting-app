import { type Metadata } from 'next';
import TastingPageHeader from '../../../components/layout/TastingPageHeader';
import FlightPageClient from '../../../components/flights/FlightPageClient';

export const metadata: Metadata = { title: 'Flight' };

export default async function FlightPage({ params }: { params: Promise<{ code: string }> }) {
	const { code } = await params;
	return (
		<div className="flight-page">
			<TastingPageHeader />
			<FlightPageClient code={code.toUpperCase()} />
		</div>
	);
}
