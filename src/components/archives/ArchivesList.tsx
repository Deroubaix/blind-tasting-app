'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthProvider } from '../auth/AuthProvider';
import ClientTastingService from '../../services/client/ClientTastingService';
import { type TastingData } from '../../types/TastingData';

const service = new ClientTastingService();

type SavedTasting = TastingData & {
	id: string;
	number?: number;
	created_at?: string;
};

export default function ArchivesList() {
	const { user, isInitialLoading } = useAuthProvider();
	const [tastings, setTastings] = useState<SavedTasting[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();
	useEffect(() => {
		if (isInitialLoading) {
			return;
		}
		if (!user) {
			router.push('/login?r=/archives');
			return;
		}
		service
			.getTastings()
			.then((data) => setTastings(data as SavedTasting[]))
			.catch(() => setError('Failed to load tastings.'))
			.finally(() => setIsLoading(false));
	}, [user, isInitialLoading, router]);

	if (isInitialLoading || isLoading) {
		return <div className="archives-loading">Loading your tastings…</div>;
	}

	if (error) {
		return <div className="archives-error">{error}</div>;
	}

	if (tastings.length === 0) {
		return (
			<div className="archives-empty">
				<p>You have no saved tastings yet.</p>
				<Link href="/tastings/start" className="btn-primary no-underline">
					Start Your First Tasting
				</Link>
			</div>
		);
	}

	return (
		<div className="archives-grid">
			{tastings.map((tasting) => {
				// Bug fix: read camelCase keys as saved by FinalConclusionTastingClient
				const final = (tasting.conclusion?.final as Record<string, string | null>) ?? {};
				const grapeVariety = final.grapeVariety ?? null;
				const countryOfOrigin = final.countryOfOrigin ?? null;
				const regionAppellation = final.regionAppellation ?? null;
				const vintage = final.vintage ?? null;

				const title = tasting.wineName || grapeVariety || 'Untitled Tasting';

				const subtitleParts = [grapeVariety, regionAppellation, countryOfOrigin].filter(Boolean);
				const subtitle =
					subtitleParts.length > 0
						? `${subtitleParts.join(', ')}${vintage ? ` — ${vintage}` : ''}`
						: (vintage ?? null);

				const date = tasting.created_at
					? new Date(tasting.created_at).toLocaleDateString('en-US', {
							year: 'numeric',
							month: 'long',
							day: '2-digit',
						})
					: null;

				return (
					<Link
						key={tasting.id}
						href={`/archives/${tasting.id}`}
						className="archive-card no-underline"
						aria-label={`View details for ${title}`}
					>
						<div className="archive-card__top">
							<span className={`wine-type-badge wine-type-badge--${tasting.wineType?.toLowerCase()}`}>
								{tasting.wineType} Wine
							</span>
							{tasting.number != null && <span className="archive-card__id">No. {tasting.number}</span>}
						</div>

						<h3 className="archive-card__title">{title}</h3>
						{subtitle && <p className="archive-card__subtitle">{subtitle}</p>}

						{tasting.notes && (
							<div className="archive-card__conclusions">
								<div className="archive-card__conclusions-label">Key Conclusions</div>
								<p className="archive-card__conclusions-text">&ldquo;{tasting.notes}&rdquo;</p>
							</div>
						)}

						<div className="archive-card__footer">
							{date && <span className="archive-card__date">{date}</span>}
							{/* visual signal only — card is the interactive element; future delete button needs e.stopPropagation() */}
							<span className="archive-card__details">Details →</span>
						</div>
					</Link>
				);
			})}

			<Link href="/tastings/start" className="archive-card archive-card--new no-underline">
				<span className="archive-card__new-icon">+</span>
				<span className="archive-card__new-label">New Tasting</span>
			</Link>
		</div>
	);
}
