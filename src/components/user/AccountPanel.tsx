'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthProvider } from '../auth/AuthProvider';
import LanguageSwitch from '../../i18n/LanguageSwitch';
import ThemeSwitch from '../../theme/ThemeSwitch';
import { useModalProvider } from '../modal/ModalProvider';
import { useToastProvider } from '../toast/ToastProvider';
import ClientTastingService from '../../services/client/ClientTastingService';
import ClientFlightService from '../../services/client/ClientFlightService';
import { JsonApiError } from '../../utils/ErrorUtils';
import { formatDate } from '../../utils/DateUtils';
import { useLang, useText } from '../../i18n/LanguageProvider';
import { userText } from '../../i18n/user';
import { commonText } from '../../i18n/common';
import { layoutText } from '../../i18n/layout';

const service = new ClientTastingService();
const flightService = new ClientFlightService();
const DELETE_ACCOUNT_MODAL = 'delete-account';

export default function AccountPanel() {
	const { user, isInitialLoading, deleteAccount, signOut } = useAuthProvider();
	const { openModal, closeModal } = useModalProvider();
	const { showToast } = useToastProvider();
	const router = useRouter();
	const { lang } = useLang();
	const { account: t, shared } = useText(userText);
	const common = useText(commonText);
	const layout = useText(layoutText);
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
		return <div className="empty-state">{common.loading}</div>;
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
				<div className="dialog">
					<p className="dialog__lead">{t.deletionLead(tastingCount)}</p>
					{flightsNote && <p className="dialog__note">{flightsNote}</p>}
					<p className="dialog__note">{t.cannotUndo}</p>
					<div className="dialog__actions">
						<button className="btn-quiet" onClick={() => closeModal(DELETE_ACCOUNT_MODAL)}>
							{t.keep}
						</button>
						<button className="btn-primary" onClick={() => remove(typed)}>
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
	// Empty while the count loads (or if it fails and no flights are hosted).
	const counts = t.counts(tastingCount, hostedFlights);

	return (
		<div className="account">
			<section className="account-card" aria-labelledby="account-details-heading">
				<h2 id="account-details-heading">{t.detailsHeading}</h2>
				<dl className="account-lines">
					<div className="account-line">
						<dt>{t.name}</dt>
						<dd>
							{user.displayName}
							<span className="account-line__note">{t.nameNote}</span>
						</dd>
					</div>
					<div className="account-line">
						<dt>{t.email}</dt>
						<dd>{user.email}</dd>
					</div>
					{memberSince && (
						<div className="account-line">
							<dt>{t.memberSince}</dt>
							<dd>{memberSince}</dd>
						</div>
					)}
				</dl>
				<p className="account-card__note">
					{t.privacyBefore}
					<Link href="/privacy">{t.privacyLink}</Link>
					{t.privacyAfter}
				</p>
			</section>

			<section className="account-card" aria-labelledby="account-prefs-heading">
				<h2 id="account-prefs-heading">{t.prefsHeading}</h2>
				<div className="account-lines">
					<div className="account-line">
						<span aria-hidden="true">{layout.appearance.label}</span>
						<ThemeSwitch />
					</div>
					<div className="account-line">
						<span aria-hidden="true">{layout.header.language}</span>
						<LanguageSwitch />
					</div>
				</div>
				<p className="account-card__note">{t.prefsNote}</p>
			</section>

			<section className="account-card" aria-labelledby="account-data-heading">
				<h2 id="account-data-heading">{t.dataHeading}</h2>
				<div className="account-block">
					<div className="account-block__row">
						{counts && <span className="account-block__title">{counts}</span>}
						<button
							type="button"
							className="btn-quiet account-block__action"
							onClick={download}
							disabled={exporting}
						>
							{exporting ? t.exporting : t.download}
						</button>
					</div>
					<p className="account-card__note">{t.exportText}</p>
					{exportError && (
						<p className="account-error" role="alert">
							{exportError}
						</p>
					)}
				</div>

				<div className="account-block account-block--delete">
					<h3 className="account-block__title">{t.deleteHeading}</h3>
					<p className="account-card__note">{t.deleteText}</p>
					{flightsNote && <p className="account-card__note">{flightsNote}</p>}
					<label className="account-delete__label" htmlFor="account-delete-password">
						{shared.password}
					</label>
					<div className="account-delete">
						<input
							id="account-delete-password"
							type="password"
							autoComplete="current-password"
							className="ledger-field"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							aria-describedby={errorText ? 'account-delete-error' : undefined}
						/>
						<button
							type="button"
							className="btn-quiet account-delete__btn"
							onClick={confirm}
							disabled={deleting}
						>
							{deleting ? t.deleting : t.deleteMine}
						</button>
					</div>
					{errorText && (
						<p className="account-error" id="account-delete-error" role="alert">
							{errorText}
						</p>
					)}
				</div>
			</section>

			<button
				type="button"
				className="account-logout"
				onClick={async () => {
					await signOut();
					router.push('/');
				}}
			>
				{t.logOut}
			</button>
		</div>
	);
}
