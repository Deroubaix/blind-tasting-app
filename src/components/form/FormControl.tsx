'use client';
import React, { type ReactNode, createContext, useContext } from 'react';
import Label from './Label';
import { useFormContext } from './Form';

export type FormControlContextType = {
	fieldId: string;
	name: string;
	label?: ReactNode;
	required?: boolean;
	disabled?: boolean;
};

const FormControlContext = createContext<FormControlContextType | null>(null);

export type FormControlProps = {
	className?: string;
	children?: ReactNode;
	label?: ReactNode;
	required?: boolean;
	name: string;
	disabled?: boolean;
	error?: string;
};

export default function FormControl(props: FormControlProps) {
	const { className, children, label, required, name, disabled } = props;

	const formContext = useFormContext();

	// Derived purely from `name`, so it is stable across renders without a ref or memo.
	const fieldId = `form-control-${name}`;

	const formControlContext: FormControlContextType = {
		fieldId,
		name,
		label,
		required,
		disabled,
	};

	const error = formContext?.form.errors[name] ?? props.error;
	const hasSubmitted = formContext?.hasSubmitted;
	const isValid = formContext?.form.isValid(name);
	const isDirty = formContext?.form.isDirty(name);
	const isTouched = formContext?.form.isTouched(name);
	const isPristine = !isTouched;

	const classNames = [
		'FormControl',
		isValid ? 'valid' : 'invalid',
		isDirty ? 'dirty' : '',
		isTouched ? 'touched' : '',
		isPristine ? 'pristine' : '',
		hasSubmitted ? 'submitted' : '',
		className,
	]
		.filter(Boolean)
		.join(' ');

	return (
		<FormControlContext.Provider value={formControlContext}>
			<div className={classNames} data-control-name={name}>
				{label && <Label htmlFor={fieldId}>{label}</Label>}
				{children}
				{error && <div className="error">{error}</div>}
			</div>
		</FormControlContext.Provider>
	);
}

export function useFormControlContext() {
	return useContext(FormControlContext);
}
