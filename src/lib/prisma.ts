import { PrismaClient } from '@prisma/client'

// Fallback to load .env.local manually if Next.js/Turbopack hasn't injected it yet
if (!process.env.DATABASE_URL) {
  require('dotenv').config({ path: ['.env.local', '.env'] });
}

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set in the environment.");
  }

  return new PrismaClient()
}

declare global {
  var prismaGlobalV3: undefined | ReturnType<typeof prismaClientSingleton>
}

// Check if we are in production to avoid multiple instances in development due to HMR
export const prisma = globalThis.prismaGlobalV3 ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobalV3 = prisma
