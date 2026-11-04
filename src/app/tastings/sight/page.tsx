import { type Metadata } from 'next';
import { SightRoute } from '../../../components/tasting/GridRoutes';

export const metadata: Metadata = {
	title: 'Sight',
};

export default async function SightPage({ searchParams }: { searchParams: Promise<{ wineType?: string }> }) {
	const { wineType: wineTypeParam } = await searchParams;
	const wineType = (wineTypeParam as 'red' | 'white') || 'red';

	return <SightRoute wineType={wineType} />;
}
