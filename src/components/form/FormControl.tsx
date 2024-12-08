'use client';

import React, { ReactNode, createContext, useContext, useMemo } from 'react';
import { v4 as uuid } from 'uuid';

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
  const fieldId = useMemo(() => uuid(), []);

  return (
    <FormControlContext.Provider value={{ fieldId, name, label }}>
      <div className={`FormControl ${className ?? ''}`}>
        {label && <label htmlFor={fieldId}>{label}</label>}
        {children}
      </div>
    </FormControlContext.Provider>
  );
}

export function useFormControlContext() {
  return useContext(FormControlContext);
}
