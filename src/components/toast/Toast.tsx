import { IconX } from '@tabler/icons-react';
import React, { type MouseEventHandler, type ReactNode, useCallback, useEffect, useRef } from 'react';
import { type ThemeColorName } from '../../styles/Colors';
import { useText } from '../../i18n/LanguageProvider';
import { userText } from '../../i18n/user';

export type ToastProps = {
	className?: string;
	title?: ReactNode;
	children?: ReactNode;
	onClose?: (toastId: string) => void;
	toastId: string;
	autoCloseMs?: number;
	color?: ThemeColorName;
};

export default function Toast(props: ToastProps) {
	const { className, title, children, onClose, toastId, autoCloseMs } = props;
	const color = props.color ?? 'primary';
	const t = useText(userText).toast;

	const ref = useRef<HTMLDivElement>(null);
	const progressRef = useRef<HTMLDivElement>(null);

	const autoCloseTimeout = useRef<NodeJS.Timeout | number | null>(null);

	const closeToast = useCallback(() => {
		if (autoCloseTimeout.current) {
			clearTimeout(autoCloseTimeout.current);
			autoCloseTimeout.current = null;
		}
		if (ref.current) {
			ref.current.classList.add('toast--closing');
			setTimeout(() => {
				onClose?.(toastId);
			}, 60);
		} else {
			onClose?.(toastId);
		}
	}, [onClose, toastId]);

	useEffect(() => {
		if (autoCloseMs && !autoCloseTimeout.current) {
			if (progressRef.current) {
				progressRef.current.style.transitionDuration = `${autoCloseMs}ms`;
			}
			setTimeout(() => {
				if (progressRef.current) {
					progressRef.current.classList.add('toast__timer--running');
				}
			}, 10);
			autoCloseTimeout.current = setTimeout(() => {
				closeToast();
			}, autoCloseMs);
		}
		return () => {
			if (autoCloseTimeout.current) {
				clearTimeout(autoCloseTimeout.current);
				autoCloseTimeout.current = null;
			}
		};
	}, [autoCloseMs, closeToast, toastId]);

	const handleCloseButtonClicked: MouseEventHandler<HTMLButtonElement> = (e) => {
		e.preventDefault();
		e.stopPropagation();
		closeToast();
	};

	return (
		<div ref={ref} id={toastId} className={`toast toast--${color} ${className ?? ''}`}>
			{title && <h4 className="toast__title">{title}</h4>}
			{children && <div className="toast__body">{children}</div>}
			<button className="toast__close" onClick={handleCloseButtonClicked} aria-label={t.dismiss}>
				<IconX aria-hidden="true" />
			</button>
			{autoCloseMs ? <div ref={progressRef} className="toast__timer" /> : null}
		</div>
	);
}
