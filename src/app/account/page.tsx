import { type Metadata } from 'next';
import TastingPageHeader from '../../components/layout/TastingPageHeader';
import LeftSidebar from '../../components/tasting/LeftSideBar';
import AccountPanel from '../../components/user/AccountPanel';

export const metadata: Metadata = {
	title: 'Account',
};

export default function AccountPage() {
	return (
		<div className="tasting-phase-page">
			<TastingPageHeader />
			<div className="tasting-phase-body">
				<LeftSidebar />
				<main className="tasting-phase-main">
					<div className="archives-hero account-hero">
						<h1>Account</h1>
					</div>
					<AccountPanel />
				</main>
			</div>
		</div>
	);
}
