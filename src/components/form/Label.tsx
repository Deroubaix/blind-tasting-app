'use client';
import React, { type ReactNode } from 'react';
import { useFormControlContext } from './FormControl';

export type LabelProps = {
	className?: string;
	children?: ReactNode;
	htmlFor?: string; // Allow passing htmlFor manually
};

export default function Label(props: LabelProps) {
	const { className, children, htmlFor } = props;

	const formControl = useFormControlContext();

	return (
		<label className={`Label ${className ?? ''}`} htmlFor={htmlFor ?? formControl?.fieldId}>
			{children}
		</label>
	);
}
