import { pageTitle } from '../../../i18n/server';
import { SightRoute } from '../../../components/tasting/GridRoutes';

export const generateMetadata = pageTitle({ en: 'Sight', pt: 'Vista' });

export default async function SightPage({ searchParams }: { searchParams: Promise<{ wineType?: string }> }) {
	const { wineType: wineTypeParam } = await searchParams;
	const wineType = (wineTypeParam as 'red' | 'white') || 'red';

	return <SightRoute wineType={wineType} />;
}
