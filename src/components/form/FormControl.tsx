"use client";

import React, { ReactNode, createContext, useContext } from "react";
import { useId } from "react";

export type FormControlContextType = {
  fieldId: string;
  name: string;
  label?: ReactNode;
};

const FormControlContext = createContext<FormControlContextType | null>(null);

export type FormControlProps = {
  className?: string;
  children?: ReactNode;
  label?: ReactNode;
  name: string;
};

export default function FormControl(props: FormControlProps) {
  const { className, children, label, name } = props;
  const fieldId = useId();

  return (
    <FormControlContext.Provider value={{ fieldId, name, label }}>
      <div className={`FormControl ${className ?? ""}`}>
        {label && <label htmlFor={fieldId}>{label}</label>}
        {children}
      </div>
    </FormControlContext.Provider>
  );
}

export function useFormControlContext() {
  return useContext(FormControlContext);
}
