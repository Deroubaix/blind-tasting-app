"use client";

import React, { forwardRef, useState } from "react";
import { useFormControlContext } from "./FormControl";

export type TextInputProps = {
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
};

export default forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  props,
  ref
) {
  const { className, placeholder, value, onChange } = props;
  const [inputValue, setInputValue] = useState(value ?? "");
  const formControl = useFormControlContext();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange?.(val);
  };

  return (
    <input
      ref={ref}
      type="text"
      id={formControl?.fieldId}
      className={`TextInput ${className ?? ""}`}
      placeholder={placeholder}
      value={inputValue}
      onChange={handleChange}
    />
  );
});
