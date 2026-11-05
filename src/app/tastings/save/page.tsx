import { pageTitle } from '../../../i18n/server';
import SavedTasting from '../../../components/tasting/SavedTastings';

export const generateMetadata = pageTitle({ en: 'Review & Save', pt: 'Rever e guardar' });

export default async function SavedTastingPage({ searchParams }: { searchParams: Promise<{ wineType?: string }> }) {
	const { wineType: wineTypeParam } = await searchParams;
	const wineType = (wineTypeParam as 'red' | 'white') || 'red';
	return <SavedTasting wineType={wineType} />;
}
