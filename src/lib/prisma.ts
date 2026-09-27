import { PrismaClient } from '@prisma/client';

/**
 * The one database client. Each `new PrismaClient()` opens its own connection pool, and there
 * were nine of them. In development every hot reload re-evaluates the modules, so a client made
 * at import time leaks a pool per edit until Postgres runs out of connections; keeping it on
 * `globalThis` lets the reloaded modules find the existing one.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma;
}
