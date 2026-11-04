import { type Metadata } from 'next';
import { PalateRoute } from '../../../components/tasting/GridRoutes';

export const metadata: Metadata = {
	title: 'Palate',
};

export default async function PalatePage({ searchParams }: { searchParams: Promise<{ wineType?: string }> }) {
	const { wineType: wineTypeParam } = await searchParams;
	const wineType = (wineTypeParam as 'red' | 'white') || 'red';
	return <PalateRoute wineType={wineType} />;
}
