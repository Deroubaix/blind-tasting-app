import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import ArchivesList from '../../components/archives/ArchivesList';
import { getText, pageTitle } from '../../i18n/server';
import { archivesText } from '../../i18n/archives';

export const generateMetadata = pageTitle({ en: archivesText.en.page.title, pt: archivesText.pt.page.title });

export default async function ArchivesPage() {
	const t = (await getText(archivesText)).page;
	return (
		<div className="site-page">
			<Header />
			<main className="site-main page-container">
				<ArchivesList title={t.title} />
			</main>
			<Footer />
		</div>
	);
}
