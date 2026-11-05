import { pageTitle } from '../../../i18n/server';
import { FinalConclusionRoute } from '../../../components/tasting/GridRoutes';

export const generateMetadata = pageTitle({ en: 'Final Conclusion', pt: 'Conclusão final' });

export default async function FinalConclusionPage({ searchParams }: { searchParams: Promise<{ wineType?: string }> }) {
	const { wineType: wineTypeParam } = await searchParams;
	const wineType = (wineTypeParam as 'red' | 'white') || 'red';
	return <FinalConclusionRoute wineType={wineType} />;
}
