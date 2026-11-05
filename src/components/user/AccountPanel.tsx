'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconDownload, IconTrash } from '@tabler/icons-react';
import { useAuthProvider } from '../auth/AuthProvider';
import { useModalProvider } from '../modal/ModalProvider';
import { useToastProvider } from '../toast/ToastProvider';
import ClientTastingService from '../../services/client/ClientTastingService';
import ClientFlightService from '../../services/client/ClientFlightService';
import { JsonApiError } from '../../utils/ErrorUtils';
import { formatDate } from '../../utils/DateUtils';
import { useLang, useText } from '../../i18n/LanguageProvider';
import { userText } from '../../i18n/user';
import { commonText } from '../../i18n/common';

const service = new ClientTastingService();
const flightService = new ClientFlightService();
const DELETE_ACCOUNT_MODAL = 'delete-account';

export default function AccountPanel() {
	const { user, isInitialLoading, deleteAccount } = useAuthProvider();
	const { openModal, closeModal } = useModalProvider();
	const { showToast } = useToastProvider();
	const router = useRouter();
	const { lang } = useLang();
	const { account: t, shared } = useText(userText);
	const common = useText(commonText);
	const [tastingCount, setTastingCount] = useState<number | null>(null);
	const [hostedFlights, setHostedFlights] = useState(0);
	const [password, setPassword] = useState('');
	// Server messages arrive as text; the client's own are keys, so they follow a language switch.
	const [error, setError] = useState<{ message: string } | 'enterPassword' | 'deleteFailed' | null>(null);
	const [deleting, setDeleting] = useState(false);
	const [exporting, setExporting] = useState(false);
	const [exportError, setExportError] = useState<string | null>(null);
	// Set once the account is gone, so signing out doesn't also send the page to log in.
	const deletedRef = useRef(false);

	useEffect(() => {
		if (isInitialLoading) {
			return;
		}
		if (!user) {
			if (!deletedRef.current) {
				router.push('/login?r=/account');
			}
			return;
		}
		service
			.getTastings()
			.then((tastings) => setTastingCount(tastings.length))
			.catch(() => setTastingCount(null));
		flightService
			.list()
			.then((flights) => setHostedFlights(flights.filter((flight) => flight.role === 'host').length))
			.catch(() => setHostedFlights(0));
	}, [user, isInitialLoading, router]);

	// Hosted flights go with the host's account, for everyone who tasted in them.
	const flightsNote = hostedFlights ? t.flightsNote(hostedFlights) : null;
	const errorText = error === null ? null : typeof error === 'string' ? t[error] : error.message;

	if (isInitialLoading || !user) {
		return <div className="archives-loading">{common.loading}</div>;
	}

	const remove = async (typed: string) => {
		closeModal(DELETE_ACCOUNT_MODAL);
		setDeleting(true);
		setError(null);
		try {
			deletedRef.current = true;
			await deleteAccount(typed);
			showToast({ title: t.deletedTitle, children: t.deletedBody });
			router.replace('/');
		} catch (err) {
			deletedRef.current = false;
			const message = JsonApiError.create(err).message;
			setError(message ? { message } : 'deleteFailed');
			setDeleting(false);
		}
	};

	const confirm = () => {
		if (!password) {
			setError('enterPassword');
			return;
		}
		const typed = password;
		openModal({
			modalId: DELETE_ACCOUNT_MODAL,
			title: t.confirmTitle,
			closeOnClickOutside: true,
			closeOnEsc: true,
			children: (
				<div className="confirm-dialog">
					<p className="confirm-dialog__lead">{t.deletionLead(tastingCount)}</p>
					{flightsNote && <p className="confirm-dialog__note">{flightsNote}</p>}
					<p className="confirm-dialog__note">{t.cannotUndo}</p>
					<div className="confirm-dialog__actions">
						<button
							className="outline confirm-dialog__cancel"
							onClick={() => closeModal(DELETE_ACCOUNT_MODAL)}
						>
							{t.keep}
						</button>
						<button className="btn-primary confirm-dialog__confirm" onClick={() => remove(typed)}>
							<IconTrash size={16} aria-hidden="true" />
							{t.deleteEverything}
						</button>
					</div>
				</div>
			),
		});
	};

	// Fetched rather than linked, so a refusal (rate limit, expired session) reads as a message
	// instead of a downloaded error file.
	const download = async () => {
		setExporting(true);
		setExportError(null);
		try {
			const response = await fetch('/api/user/export');
			if (!response.ok) {
				const body = await response.json().catch(() => null);
				throw new Error(body?.message || t.exportFailed);
			}
			const name = response.headers.get('Content-Disposition')?.match(/filename="([^"]+)"/)?.[1];
			const url = URL.createObjectURL(await response.blob());
			const link = Object.assign(document.createElement('a'), { href: url, download: name ?? 'export.zip' });
			link.click();
			URL.revokeObjectURL(url);
		} catch (err) {
			setExportError(err instanceof Error ? err.message : t.exportFailed);
		} finally {
			setExporting(false);
		}
	};

	const memberSince = user.created_at ? formatDate(user.created_at, lang) : null;

	return (
		<div className="account">
			<section className="account-card" aria-labelledby="account-details-heading">
				<h2 className="account-card__heading" id="account-details-heading">
					{t.detailsHeading}
				</h2>
				<dl className="account-details">
					<dt>{t.name}</dt>
					<dd>{user.displayName}</dd>
					<dt>{t.email}</dt>
					<dd>{user.email}</dd>
					{memberSince && (
						<>
							<dt>{t.memberSince}</dt>
							<dd>{memberSince}</dd>
						</>
					)}
					<dt>{t.tastings}</dt>
					<dd>{tastingCount ?? '—'}</dd>
				</dl>
				<p className="account-card__note">
					{t.privacyBefore}
					<Link href="/privacy">{t.privacyLink}</Link>
					{t.privacyAfter}
				</p>
			</section>

			<section className="account-card" aria-labelledby="account-export-heading">
				<h2 className="account-card__heading" id="account-export-heading">
					{t.exportHeading}
				</h2>
				<p className="account-card__text">{t.exportText}</p>
				<button
					type="button"
					className="btn-primary account-export__btn"
					onClick={download}
					disabled={exporting}
				>
					<IconDownload size={16} aria-hidden="true" />
					{exporting ? t.exporting : t.download}
				</button>
				{exportError && (
					<p className="account-delete__error" role="alert">
						{exportError}
					</p>
				)}
			</section>

			<section className="account-card account-card--danger" aria-labelledby="account-delete-heading">
				<h2 className="account-card__heading" id="account-delete-heading">
					{t.deleteHeading}
				</h2>
				<p className="account-card__text">{t.deleteText}</p>
				{flightsNote && <p className="account-card__text">{flightsNote}</p>}
				<div className="account-delete">
					<label className="account-delete__label" htmlFor="account-delete-password">
						{shared.password}
					</label>
					<input
						id="account-delete-password"
						type="password"
						autoComplete="current-password"
						className="tasting-input account-delete__input"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						aria-describedby={errorText ? 'account-delete-error' : undefined}
					/>
					<button
						type="button"
						className="btn-primary account-delete__btn"
						onClick={confirm}
						disabled={deleting}
					>
						<IconTrash size={16} aria-hidden="true" />
						{deleting ? t.deleting : t.deleteMine}
					</button>
				</div>
				{errorText && (
					<p className="account-delete__error" id="account-delete-error" role="alert">
						{errorText}
					</p>
				)}
			</section>
		</div>
	);
}
