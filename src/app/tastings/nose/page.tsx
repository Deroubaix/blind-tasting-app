import { type Metadata } from 'next';
import { NoseRoute } from '../../../components/tasting/GridRoutes';

export const metadata: Metadata = {
	title: 'Nose',
};

export default async function NosePage({ searchParams }: { searchParams: Promise<{ wineType?: string }> }) {
	const { wineType: wineTypeParam } = await searchParams;
	const wineType = (wineTypeParam as 'red' | 'white') || 'red';
	return <NoseRoute wineType={wineType} />;
}
