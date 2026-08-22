'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { IconCamera, IconX } from '@tabler/icons-react';
import { useTastingContext } from '../tasting/TastingContext';
import ClientTastingService from '../../services/client/ClientTastingService';
import { useAuthProvider } from '../auth/AuthProvider';
import { useToastProvider } from '../../toast/ToastProvider';
import useLoadTracker from '../../hooks/useLoadTracker';
import { JsonApiError } from '../../utils/ErrorUtils';
import TastingPhaseLayout from '../layout/TastingPhaseLayout';
import PhaseHeading from '../layout/PhaseHeading';

export default function SavedTasting({ wineType }: { wineType: 'red' | 'white' }) {
	const { tastingData, updateTastingData, resetTastingData } = useTastingContext();
	const [notes, setNotes] = useState(tastingData.notes || '');
	const [photoPreview, setPhotoPreview] = useState<string | null>(null);
	const { isLoading, addLoader, removeLoader } = useLoadTracker();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const autoSaveTriggered = useRef(false);
	const router = useRouter();
	const searchParams = useSearchParams();
	const autoSave = searchParams.get('autoSave') === '1';
	const tastingService = new ClientTastingService();
	const { user, isInitialLoading } = useAuthProvider();
	const { showToast } = useToastProvider();

	const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) {
			return;
		}
		const reader = new FileReader();
		reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
		reader.readAsDataURL(file);
	};

	const saveRedirect = `/login?r=${encodeURIComponent(`/tastings/save?wineType=${wineType}&autoSave=1`)}`;

	const handleSave = async () => {
		if (!user) {
			showToast({
				title: 'Log in required',
				children: 'Please log in or sign up to save your tasting.',
				color: 'error',
			});
			router.push(saveRedirect);
			return;
		}

		const loader = addLoader();
		updateTastingData({ notes });

		try {
			await tastingService.saveTasting({ ...tastingData, notes });
			resetTastingData();
			router.push('/archives');
		} catch (error) {
			const apiError = JsonApiError.create(error);
			const isAuthError = apiError.statusCode === 401;
			if (isAuthError) {
				showToast({
					title: 'Log in required',
					children: 'Please log in to save your tasting.',
					color: 'error',
				});
				router.push(saveRedirect);
			} else {
				showToast({
					title: 'Save failed',
					children: 'Something went wrong. Please try again.',
					color: 'error',
				});
			}
		} finally {
			removeLoader(loader);
		}
	};

	useEffect(() => {
		if (!autoSave || isInitialLoading || !user || autoSaveTriggered.current) {
			return;
		}
		autoSaveTriggered.current = true;
		handleSave();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [autoSave, isInitialLoading, user]);

	return (
		<TastingPhaseLayout
			wineType={wineType}
			footer={{
				onBack: () => router.push(`/tastings/final-conclusion?wineType=${wineType}`),
				backLabel: '← Back to Final Conclusion',
				nextLabel: 'Save Tasting',
				onNext: handleSave,
				nextLoading: isLoading,
			}}
		>
			<PhaseHeading
				phase="Wrap Up"
				title="Review & Save"
				description="Add any final notes and capture the wine label before saving your tasting record."
			/>

			<div className="save-layout">
				{/* Notes */}
				<div className="tasting-card">
					<div className="tasting-card__label">Notes</div>
					<textarea
						className="tasting-textarea"
						rows={6}
						placeholder="Add your final observations, impressions, or anything worth remembering..."
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
					/>
				</div>

				{/* Photo */}
				<div className="tasting-card">
					<div className="tasting-card__label">Wine Label Photo</div>
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						capture="environment"
						style={{ display: 'none' }}
						onChange={handlePhotoChange}
					/>
					{photoPreview ? (
						<div className="save-photo-preview">
							{/* Local FileReader data URL — next/image has nothing to optimise here and
							    would need `unoptimized`, so a plain img is the right element. */}
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src={photoPreview} alt="Wine label" className="save-photo-preview__img" />
							<button
								className="save-photo-remove"
								onClick={() => {
									setPhotoPreview(null);
									if (fileInputRef.current) {
										fileInputRef.current.value = '';
									}
								}}
							>
								<IconX size={14} />
								Remove
							</button>
						</div>
					) : (
						<button className="save-photo-btn" onClick={() => fileInputRef.current?.click()}>
							<IconCamera size={18} />
							Take / Choose Photo
						</button>
					)}
				</div>
			</div>
		</TastingPhaseLayout>
	);
}
