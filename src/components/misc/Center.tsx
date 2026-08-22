import type { ReactNode } from 'react';
import React from 'react';

export type CenterProps = {
	className?: string;
	children?: ReactNode;
};

export default function Center(props: CenterProps) {
	const { className, children } = props;

	return <div className={`Center ${className ?? ''}`}>{children}</div>;
}
