import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import TastingDetail from '../../../components/archives/TastingDetail';
import { pageTitle } from '../../../i18n/server';
import { archivesText } from '../../../i18n/archives';

export const generateMetadata = pageTitle({
	en: archivesText.en.page.detailTitle,
	pt: archivesText.pt.page.detailTitle,
});

export default async function TastingDetailPage({
	params,
	searchParams,
}: {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ reveal?: string }>;
}) {
	const { id } = await params;
	// `?reveal=1`: arrived from an archive card's Reveal button, so open straight onto the form.
	const openReveal = (await searchParams).reveal === '1';

	return (
		<div className="site-page">
			<Header />
			<main className="site-main page-container">
				<TastingDetail id={id} openReveal={openReveal} />
			</main>
			<Footer />
		</div>
	);
}
