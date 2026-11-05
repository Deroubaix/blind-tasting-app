import { pageTitle } from '../../../i18n/server';
import { PalateRoute } from '../../../components/tasting/GridRoutes';

export const generateMetadata = pageTitle({ en: 'Palate', pt: 'Paladar' });

export default async function PalatePage({ searchParams }: { searchParams: Promise<{ wineType?: string }> }) {
	const { wineType: wineTypeParam } = await searchParams;
	const wineType = (wineTypeParam as 'red' | 'white') || 'red';
	return <PalateRoute wineType={wineType} />;
}
