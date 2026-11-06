import { pageTitle } from '../../../../../../i18n/server';
import Header from '../../../../../../components/layout/Header';
import Footer from '../../../../../../components/layout/Footer';
import FlightRevealClient from '../../../../../../components/flights/FlightRevealClient';

export const generateMetadata = pageTitle({ en: 'Reveal', pt: 'Revelação' });

export default async function FlightRevealPage({ params }: { params: Promise<{ code: string; n: string }> }) {
	const { code, n } = await params;
	return (
		<div className="site-page">
			<Header />
			<FlightRevealClient code={code.toUpperCase()} number={Number(n)} />
			<Footer />
		</div>
	);
}
