import { type Metadata } from 'next';
import { InitialConclusionRoute } from '../../../components/tasting/GridRoutes';

export const metadata: Metadata = {
	title: 'Initial Conclusion',
};

export default async function InitialConclusionPage({
	searchParams,
}: {
	searchParams: Promise<{ wineType?: string }>;
}) {
	const { wineType: wineTypeParam } = await searchParams;
	const wineType = (wineTypeParam as 'red' | 'white') || 'red';
	return <InitialConclusionRoute wineType={wineType} />;
}
