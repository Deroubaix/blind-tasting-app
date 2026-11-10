import { redirect } from 'next/navigation';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import TastingDetail from '../../../components/archives/TastingDetail';
import { pageTitle } from '../../../i18n/server';
import { archivesText } from '../../../i18n/archives';
import ServerServices from '../../../services/server/ServerServices';
import SessionService from '../../../services/server/SessionService';

export const dynamic = 'force-dynamic';

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
	// `?reveal=1`: arrived from the home dashboard's Reveal link, so open straight onto the form.
	const openReveal = (await searchParams).reveal === '1';
	if (!(await ServerServices.getClass(SessionService).currentUserId())) {
		const back = `/archives/${encodeURIComponent(id)}${openReveal ? '?reveal=1' : ''}`;
		redirect(`/login?r=${encodeURIComponent(back)}`);
	}

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
