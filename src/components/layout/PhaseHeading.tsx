import React, { type ReactNode } from 'react';

type PhaseHeadingProps = {
	title: string;
	description: ReactNode;
};

export default function PhaseHeading({ title, description }: PhaseHeadingProps) {
	return (
		<header className="phase-head">
			<h1>{title}</h1>
			<p className="phase-description">{description}</p>
		</header>
	);
}
