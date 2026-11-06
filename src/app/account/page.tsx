import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import AccountPanel from '../../components/user/AccountPanel';
import { getText, pageTitle } from '../../i18n/server';
import { userText } from '../../i18n/user';

export const generateMetadata = pageTitle({ en: userText.en.pages.account, pt: userText.pt.pages.account });

export default async function AccountPage() {
	const t = (await getText(userText)).pages;
	return (
		<div className="site-page">
			<Header />
			<main className="site-main page-container">
				<header className="page-head account-head">
					<h1 className="page-head__title">{t.account}</h1>
				</header>
				<AccountPanel />
			</main>
			<Footer />
		</div>
	);
}
