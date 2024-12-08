"use client";

import React, { forwardRef, useState } from "react";
import { useFormControlContext } from "./FormControl";

export type CheckboxProps = {
  className?: string;
  value?: boolean;
  onChange?: (value: boolean) => void;
};

export default forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  props,
  ref
) {
  const { className, value, onChange } = props;
  const [checked, setChecked] = useState(value ?? false);
  const formControl = useFormControlContext();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setChecked(isChecked);
    onChange?.(isChecked);
  };

  return (
    <div className={`Checkbox ${className ?? ""} ${checked ? "checked" : ""}`}>
      <input
        ref={ref}
        type="checkbox"
        id={formControl?.fieldId}
        checked={checked}
        onChange={handleChange}
      />
    </div>
  );
});
