import { Prisma } from '@prisma/client';
import { type RevealInput } from '../schemas/tasting';

/** A reveal with at least one field, stamped now; otherwise nothing is stored. */
export function revealFields(reveal: RevealInput | null | undefined) {
	const hasAny = reveal && Object.entries(reveal).some(([key, value]) => key !== 'wineName' && value);
	return hasAny
		? { reveal: reveal as Prisma.InputJsonValue, revealedAt: new Date() }
		: { reveal: Prisma.DbNull, revealedAt: null };
}
