import { type Metadata } from 'next';
import TastingPageHeader from '../../../../../../components/layout/TastingPageHeader';
import FlightRevealClient from '../../../../../../components/flights/FlightRevealClient';

export const metadata: Metadata = { title: 'Reveal' };

export default async function FlightRevealPage({ params }: { params: Promise<{ code: string; n: string }> }) {
	const { code, n } = await params;
	return (
		<div className="flight-page">
			<TastingPageHeader />
			<FlightRevealClient code={code.toUpperCase()} number={Number(n)} />
		</div>
	);
}
