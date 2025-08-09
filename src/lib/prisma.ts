import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Connection management
export async function connectToDB() {
  try {
    await prisma.$connect();
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw error;
  }
}

export async function disconnectFromDB() {
  await prisma.$disconnect();
} 