import { pageTitle } from '../../../i18n/server';
import { InitialConclusionRoute } from '../../../components/tasting/GridRoutes';

export const generateMetadata = pageTitle({ en: 'Initial Conclusion', pt: 'Conclusão inicial' });

export default async function InitialConclusionPage({
	searchParams,
}: {
	searchParams: Promise<{ wineType?: string }>;
}) {
	const { wineType: wineTypeParam } = await searchParams;
	const wineType = (wineTypeParam as 'red' | 'white') || 'red';
	return <InitialConclusionRoute wineType={wineType} />;
}
