import { pageTitle } from '../../../i18n/server';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import FlightPageClient from '../../../components/flights/FlightPageClient';

export const generateMetadata = pageTitle({ en: 'Flight', pt: 'Flight' });

export default async function FlightPage({ params }: { params: Promise<{ code: string }> }) {
	const { code } = await params;
	return (
		<div className="site-page">
			<Header />
			<FlightPageClient code={code.toUpperCase()} />
			<Footer />
		</div>
	);
}
