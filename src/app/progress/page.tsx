import { redirect } from 'next/navigation';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import ProgressClient from '../../components/progress/ProgressClient';
import { toProgressTasting } from '../../utils/progressStats';
import ServerServices from '../../services/server/ServerServices';
import SessionService from '../../services/server/SessionService';
import ProgressService from '../../services/server/ProgressService';
import TastingService from '../../services/server/TastingService';
import UserService from '../../services/server/UserService';
import { getLang, pageTitle } from '../../i18n/server';
import { progressText } from '../../i18n/progress';
import { type TastingData } from '../../types/TastingData';

export const dynamic = 'force-dynamic';

export const generateMetadata = pageTitle({ en: progressText.en.title, pt: progressText.pt.title });

// The same shell as the Archive it sits beside.
export default async function ProgressPage() {
	const userId = await ServerServices.getClass(SessionService).currentUserId();
	if (!userId) {
		redirect('/login?r=/progress');
	}

	const [user, tastings, palate, lang] = await Promise.all([
		ServerServices.getClass(UserService).me(userId),
		ServerServices.getClass(TastingService).list(userId),
		ServerServices.getClass(ProgressService).palateSamples(userId),
		getLang(),
	]);
	// The stored JSON columns hold what the tasting flow saved, which is TastingData's shape.
	const list = tastings.map((tasting) =>
		toProgressTasting(
			{ ...(tasting as unknown as TastingData), id: tasting.id, created_at: tasting.created_at.toISOString() },
			lang,
		),
	);

	return (
		<div className="site-page">
			<Header />
			<main className="site-main page-container">
				<ProgressClient
					list={list}
					palate={palate}
					name={user?.displayName ?? ''}
					memberSince={user?.created_at?.toISOString() ?? null}
				/>
			</main>
			<Footer />
		</div>
	);
}
