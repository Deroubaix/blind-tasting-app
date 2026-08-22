'use client';

import React, { useEffect, useState } from 'react';
import ClientTastingService from '../../services/client/ClientTastingService';
import { type TastingData } from '../../types/TastingData';
import { useAuthProvider } from '../../components/auth/AuthProvider';

// Module scope: a per-render instance would make the fetch effect re-fire endlessly once it
// is listed as a dependency.
const tastingService = new ClientTastingService();

export default function UserProfile() {
	const { user } = useAuthProvider();
	const [tastings, setTastings] = useState<TastingData[]>([]);
	const [error, setError] = useState<string | null>(null);
	useEffect(() => {
		const fetchTastings = async () => {
			try {
				const fetchedTastings = await tastingService.getTastings();
				setTastings(fetchedTastings);
			} catch (error) {
				console.warn('Failed to fetch tastings:', error);
				setError('Failed to fetch tastings. Please try again later.');
			}
		};

		if (user) {
			fetchTastings();
		}
	}, [user]);

	if (!user) {
		return <p>Please log in to view your tastings.</p>;
	}

	return (
		<div className="UserProfile">
			<h1>Welcome, {user.displayName}</h1>
			<h2>Your Tastings</h2>
			{error ? (
				<p className="error">{error}</p>
			) : tastings.length > 0 ? (
				<ul>
					{tastings.map((tasting) => (
						<li key={tasting.id}>
							<h3>{tasting.wineName || 'Unnamed Wine'}</h3>
							<p>Type: {tasting.wineType}</p>
							<p>Timer: {tasting.timerDuration ? `${tasting.timerDuration} min` : 'No Timer'}</p>
							<p>Initial Conclusion: {JSON.stringify(tasting.conclusion?.initial || {}, null, 2)}</p>
							<p>Final Conclusion: {JSON.stringify(tasting.conclusion?.final || {}, null, 2)}</p>
							<p>Notes: {tasting.notes || 'No notes added.'}</p>
						</li>
					))}
				</ul>
			) : (
				<p>No tastings found. Start your first wine tasting!</p>
			)}
		</div>
	);
}
