import { PrismaClient } from '@prisma/client';

/**
 * Global Prisma Client instance configured for Next.js.
 * In development, prevents exhausting PostgreSQL database connection pool
 * caused by Next.js hot-module reloading.
 */

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
