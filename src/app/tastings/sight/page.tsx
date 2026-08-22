import { type Metadata } from 'next';
import SightTastingClient from '../../../components/sight/SightTastingClient';

export const metadata: Metadata = {
	title: 'Sight | Wine Tasting',
};

export default async function SightPage({ searchParams }: { searchParams: Promise<{ wineType?: string }> }) {
	const { wineType: wineTypeParam } = await searchParams;
	const wineType = (wineTypeParam as 'red' | 'white') || 'red';

	return <SightTastingClient wineType={wineType} />;
}
