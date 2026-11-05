import { redirect } from 'next/navigation';
import TastingPageHeader from '../../components/layout/TastingPageHeader';
import LeftSidebar from '../../components/tasting/LeftSideBar';
import ProgressClient from '../../components/progress/ProgressClient';
import { toProgressTasting } from '../../components/progress/progressStats';
import { currentUserId } from '../../lib/auth';
import ServerServices from '../../services/server/ServerServices';
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
	const userId = await currentUserId();
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
		<div className="tasting-phase-page">
			<TastingPageHeader />
			<div className="tasting-phase-body">
				<LeftSidebar />
				<main className="tasting-phase-main">
					<ProgressClient
						list={list}
						palate={palate}
						name={user?.displayName ?? ''}
						memberSince={user?.created_at?.toISOString() ?? null}
					/>
				</main>
			</div>
		</div>
	);
}
