import React, { type ReactNode } from 'react';
import splitPhaseLabel from './phaseLabel';

type PhaseHeadingProps = {
	phase: string;
	title: string;
	description: ReactNode;
};

export default function PhaseHeading({ phase, title, description }: PhaseHeadingProps) {
	const { name, number } = splitPhaseLabel(phase);

	return (
		<>
			<div className="phase-label">
				{number ? (
					<>
						{name} <span className="phase-label__num">{number}</span>
					</>
				) : (
					phase
				)}
			</div>
			<h1>{title}</h1>
			<p className="phase-description">{description}</p>
		</>
	);
}
