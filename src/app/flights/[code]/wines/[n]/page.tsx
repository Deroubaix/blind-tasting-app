import { pageTitle } from '../../../../../i18n/server';
import Header from '../../../../../components/layout/Header';
import Footer from '../../../../../components/layout/Footer';
import WineResultsClient from '../../../../../components/flights/WineResultsClient';

export const generateMetadata = pageTitle({ en: 'Wine Results', pt: 'Resultados do vinho' });

export default async function WineResultsPage({ params }: { params: Promise<{ code: string; n: string }> }) {
	const { code, n } = await params;
	return (
		<div className="site-page">
			<Header />
			<WineResultsClient code={code.toUpperCase()} number={Number(n)} />
			<Footer />
		</div>
	);
}
