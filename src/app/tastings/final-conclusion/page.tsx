import { type Metadata } from 'next';
import { FinalConclusionRoute } from '../../../components/tasting/GridRoutes';

export const metadata: Metadata = {
	title: 'Final Conclusion',
};

export default async function FinalConclusionPage({ searchParams }: { searchParams: Promise<{ wineType?: string }> }) {
	const { wineType: wineTypeParam } = await searchParams;
	const wineType = (wineTypeParam as 'red' | 'white') || 'red';
	return <FinalConclusionRoute wineType={wineType} />;
}
