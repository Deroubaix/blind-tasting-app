'use client';
import React, { forwardRef, useEffect, useState } from 'react';
import { useFormControlContext } from './FormControl';
import { useFormContext } from './Form';

export type TextAreaProps = {
	className?: string;
	placeholder?: HTMLTextAreaElement['placeholder'];
	rows?: HTMLTextAreaElement['rows'];
	cols?: HTMLTextAreaElement['cols'];
	disabled?: boolean;
	autoComplete?: string;
	value?: string;
	onChange?: (value: string) => void;
};

export default forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(props: TextAreaProps, ref) {
	const { className, placeholder, rows, cols, autoComplete, value, onChange } = props;

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
					onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => {
						const val = e.target.value;
						setInputValue(val);
						onChange?.(val);
					},
				};

	return (
		<textarea
			ref={ref}
			rows={rows}
			cols={cols}
			className={`TextArea ${className ?? ''}`}
			placeholder={placeholder}
			id={formControl?.fieldId}
			disabled={disabled}
			autoComplete={autoComplete}
			{...formInputProps}
		/>
	);
});
