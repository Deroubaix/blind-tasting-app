import { type FormErrors } from '@mantine/form';
import { type z } from 'zod';
import { PASSWORD_MIN_LENGTH } from '../schemas/auth';
import { type Lang } from '../i18n';
import { userText } from '../i18n/user';

/**
 * Bridges a zod schema into Mantine's `validate` option.
 *
 * @mantine/form v7 has no built-in schema resolver (that arrived in v8 as `schemaResolver`), and
 * the standalone `mantine-form-zod-resolver` package isn't worth a dependency for this.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function zodResolver<Values>(schema: z.ZodType<any, any, any>) {
	return (values: Values): FormErrors => {
		const result = schema.safeParse(values);

		if (result.success) {
			return {};
		}

		const errors: FormErrors = {};
		for (const issue of result.error.issues) {
			const path = issue.path.join('.');
			// Keep the first error per field — Mantine renders one message per control.
			if (path && !(path in errors)) {
				errors[path] = issue.message;
			}
		}
		return errors;
	};
}

type Validation = (typeof userText)[Lang]['validation'];
type ValidationKey = keyof Validation;

const validationMessage = (v: Validation, key: ValidationKey) => {
	const value = v[key];
	return typeof value === 'function' ? value(PASSWORD_MIN_LENGTH) : value;
};

/** A shared schema's English message in `lang`; an unknown message passes through. */
export function translateValidation(message: string, lang: Lang): string {
	const keys = Object.keys(userText.en.validation) as ValidationKey[];
	const key = keys.find((k) => validationMessage(userText.en.validation, k) === message);
	return key ? validationMessage(userText[lang].validation, key) : message;
}

/** zodResolver in `lang`: the schemas keep the API's English, swapped here. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function translatedResolver<Values>(schema: z.ZodType<any, any, any>, lang: Lang) {
	const resolve = zodResolver<Values>(schema);
	return (values: Values): FormErrors => {
		const errors = resolve(values);
		for (const [path, message] of Object.entries(errors)) {
			errors[path] = translateValidation(message as string, lang);
		}
		return errors;
	};
}
