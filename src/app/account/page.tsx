import TastingPageHeader from '../../components/layout/TastingPageHeader';
import LeftSidebar from '../../components/tasting/LeftSideBar';
import AccountPanel from '../../components/user/AccountPanel';
import { getText, pageTitle } from '../../i18n/server';
import { userText } from '../../i18n/user';

export const generateMetadata = pageTitle({ en: userText.en.pages.account, pt: userText.pt.pages.account });

export default async function AccountPage() {
	const t = (await getText(userText)).pages;
	return (
		<div className="tasting-phase-page">
			<TastingPageHeader />
			<div className="tasting-phase-body">
				<LeftSidebar />
				<main className="tasting-phase-main">
					<div className="archives-hero account-hero">
						<h1>{t.account}</h1>
					</div>
					<AccountPanel />
				</main>
			</div>
		</div>
	);
}
