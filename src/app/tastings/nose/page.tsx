import { pageTitle } from '../../../i18n/server';
import { NoseRoute } from '../../../components/tasting/GridRoutes';

export const generateMetadata = pageTitle({ en: 'Nose', pt: 'Nariz' });

export default async function NosePage({ searchParams }: { searchParams: Promise<{ wineType?: string }> }) {
	const { wineType: wineTypeParam } = await searchParams;
	const wineType = (wineTypeParam as 'red' | 'white') || 'red';
	return <NoseRoute wineType={wineType} />;
}
