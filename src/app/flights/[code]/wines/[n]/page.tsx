import { type Metadata } from 'next';
import TastingPageHeader from '../../../../../components/layout/TastingPageHeader';
import WineResultsClient from '../../../../../components/flights/WineResultsClient';

export const metadata: Metadata = { title: 'Wine Results' };

export default async function WineResultsPage({ params }: { params: Promise<{ code: string; n: string }> }) {
	const { code, n } = await params;
	return (
		<div className="flight-page">
			<TastingPageHeader />
			<WineResultsClient code={code.toUpperCase()} number={Number(n)} />
		</div>
	);
}
