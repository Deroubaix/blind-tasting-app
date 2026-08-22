import { type FormErrors } from '@mantine/form';
import { type z } from 'zod';

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
