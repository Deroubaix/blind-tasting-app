import { pageTitle } from '../../../../../../i18n/server';
import TastingPageHeader from '../../../../../../components/layout/TastingPageHeader';
import FlightRevealClient from '../../../../../../components/flights/FlightRevealClient';

export const generateMetadata = pageTitle({ en: 'Reveal', pt: 'Revelação' });

export default async function FlightRevealPage({ params }: { params: Promise<{ code: string; n: string }> }) {
	const { code, n } = await params;
	return (
		<div className="flight-page">
			<TastingPageHeader />
			<FlightRevealClient code={code.toUpperCase()} number={Number(n)} />
		</div>
	);
}
