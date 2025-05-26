// src/lib/prisma.ts
import { PrismaClient } from '@/generated/prisma'; // Default import from generated client

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

let prismaInstance: PrismaClient; // Renamed to avoid conflict with global for clarity in this scope

if (process.env.NODE_ENV === 'production') {
  prismaInstance = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prismaInstance = global.prisma;
}

export default prismaInstance;