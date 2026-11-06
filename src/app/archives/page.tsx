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
				<header className="page-head archives-head">
					<div>
						<h1 className="page-head__title">{t.title}</h1>
						<p className="page-head__sub">{t.description}</p>
					</div>
				</header>
				<ArchivesList />
			</main>
			<Footer />
		</div>
	);
}
