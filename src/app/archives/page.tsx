import TastingPageHeader from '../../components/layout/TastingPageHeader';
import LeftSidebar from '../../components/tasting/LeftSideBar';
import ArchivesList from '../../components/archives/ArchivesList';
import { getText, pageTitle } from '../../i18n/server';
import { archivesText } from '../../i18n/archives';

export const generateMetadata = pageTitle({ en: archivesText.en.page.title, pt: archivesText.pt.page.title });

export default async function ArchivesPage() {
	const t = (await getText(archivesText)).page;
	return (
		<div className="tasting-phase-page">
			<TastingPageHeader />
			<div className="tasting-phase-body">
				<LeftSidebar />
				<main className="tasting-phase-main">
					<div className="archives-hero">
						<h1>{t.title}</h1>
						<p className="archives-hero__description">{t.description}</p>
					</div>
					<ArchivesList />
				</main>
			</div>
		</div>
	);
}
