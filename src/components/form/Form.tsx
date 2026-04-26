"use client";

import { FormErrors, UseFormReturnType } from "@mantine/form";
import React, {
  FormEvent,
  ReactNode,
  createContext,
  useContext,
  useMemo,
} from "react";
import { v4 as uuid } from "uuid";

export type _TransformValues<Values> = (values: Values) => unknown;

export type FormContextType<
  Values = Record<string, unknown>,
  TransformValues extends _TransformValues<Values> = (values: Values) => Values
> = {
  formId: string;
  form: UseFormReturnType<Values, TransformValues>;
  disabled?: boolean;
  hasSubmitted: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FormContext = createContext<FormContextType<any, any> | null>(null);

export type FormProps<
  Values = Record<string, unknown>,
  TransformValues extends _TransformValues<Values> = (v: Values) => Values
> = {
  className?: string;
  children?: ReactNode;
  form: UseFormReturnType<Values, TransformValues>;
  disabled?: boolean;
  onSubmit?: (
    values: ReturnType<TransformValues>,
    event: FormEvent<HTMLFormElement> | undefined
  ) => void;
  onValidationFailure?: (
    errors: FormErrors,
    values: Values,
    event: FormEvent<HTMLFormElement> | undefined
  ) => void;
};

export default function Form<
  Values = Record<string, unknown>,
  TransformValues extends _TransformValues<Values> = (values: Values) => Values
>(props: FormProps<Values, TransformValues>) {
  const { className, children, form, disabled, onSubmit, onValidationFailure } =
    props;

  const [hasSubmitted, setHasSubmitted] = React.useState(false);

  const formId = useMemo(() => uuid(), []);

  const formContext: FormContextType<Values, TransformValues> = {
    form,
    formId,
    disabled,
    hasSubmitted,
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setHasSubmitted(true);

    // We need to wrap the handleSubmit and handleValidationError callbacks otherwise validation doesn't work properly
    // due to potentially unset callbacks
    form.onSubmit(
      (
        values: ReturnType<TransformValues>,
        event: FormEvent<HTMLFormElement> | undefined
      ) => {
        onSubmit?.(values, event);
      },
      (
        errors: FormErrors,
        values: Values,
        event: FormEvent<HTMLFormElement> | undefined
      ) => {
        onValidationFailure?.(errors, values, event);
      }
    )(e);
  };

  return (
    <FormContext.Provider value={formContext}>
      <form
        className={`Form ${className ?? ""}`}
        id={formContext.formId}
        onSubmit={handleSubmit}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
}

export function useFormContext<
  V,
  T extends _TransformValues<V> = (v: V) => V
>() {
  return useContext(FormContext) as FormContextType<V, T>;
}
