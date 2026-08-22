'use client';
import React, { forwardRef, useEffect, useState } from 'react';
import { useFormControlContext } from './FormControl';
import { useFormContext } from './Form';

export type TextInputProps = {
	className?: string;
	type?: HTMLInputElement['type'];
	placeholder?: HTMLInputElement['placeholder'];
	disabled?: boolean;
	autoComplete?: string;
	value?: string;
	onChange?: (value: string) => void;
	onBlur?: (value: string) => void;
};

export default forwardRef<HTMLInputElement, TextInputProps>(function TextInput(props: TextInputProps, ref) {
	const { className, type, placeholder, autoComplete, value, onChange, onBlur } = props;

	const [inputValue, setInputValue] = useState(value ?? '');

	useEffect(() => {
		setInputValue(value ?? '');
	}, [value]);

	const formContext = useFormContext();
	const formControl = useFormControlContext();

	const disabled = props.disabled || formControl?.disabled || formContext?.disabled;
	const formInputProps =
		formContext && formControl
			? formContext.form.getInputProps(formControl.name)
			: {
					value: inputValue,
					onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
						const val = e.target.value;
						setInputValue(val);
						onChange?.(val);
					},
					onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
						const val = e.target.value;
						setInputValue(val);
						onBlur?.(val);
					},
				};

	return (
		<input
			ref={ref}
			className={`TextInput ${className ?? ''}`}
			type={type}
			placeholder={placeholder}
			id={formControl?.fieldId}
			disabled={disabled}
			autoComplete={autoComplete}
			{...formInputProps}
		/>
	);
});
