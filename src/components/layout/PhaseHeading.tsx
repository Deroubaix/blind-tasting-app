import React, { type ReactNode } from 'react';

type PhaseHeadingProps = {
	title: string;
	description: ReactNode;
	/** Beside the description: Start over on a phone. */
	aside?: ReactNode;
};

export default function PhaseHeading({ title, description, aside }: PhaseHeadingProps) {
	return (
		<header className="phase-head">
			<h1>{title}</h1>
			<div className="phase-head__row">
				<p className="phase-description">{description}</p>
				{aside}
			</div>
		</header>
	);
}
