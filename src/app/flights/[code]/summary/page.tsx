import { pageTitle } from '../../../../i18n/server';
import Header from '../../../../components/layout/Header';
import Footer from '../../../../components/layout/Footer';
import FlightSummaryClient from '../../../../components/flights/FlightSummaryClient';

export const generateMetadata = pageTitle({ en: 'Flight Summary', pt: 'Resumo do flight' });

export default async function FlightSummaryPage({ params }: { params: Promise<{ code: string }> }) {
	const { code } = await params;
	return (
		<div className="site-page">
			<Header />
			<FlightSummaryClient code={code.toUpperCase()} />
			<Footer />
		</div>
	);
}
