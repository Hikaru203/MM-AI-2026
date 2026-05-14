import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * A lazy-loaded PrismaClient instance.
 * This prevents Prisma initialization errors during the Next.js build phase
 * because the client is only instantiated when first accessed.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop, receiver) {
    // If the property is one of the PrismaClient methods or models
    if (!globalForPrisma.prisma) {
      console.log("Initializing Prisma Client (lazy)...");
      globalForPrisma.prisma = new PrismaClient();
    }
    return Reflect.get(globalForPrisma.prisma, prop, receiver);
  }
});
