import TastingPageHeader from '../../../components/layout/TastingPageHeader';
import LeftSidebar from '../../../components/tasting/LeftSideBar';
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
		<div className="tasting-phase-page">
			<TastingPageHeader />
			<div className="tasting-phase-body">
				<LeftSidebar />
				<main className="tasting-phase-main">
					<TastingDetail id={id} openReveal={openReveal} />
				</main>
			</div>
		</div>
	);
}
