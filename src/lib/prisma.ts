import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

function getDatabaseUrl(): string {
  let url = '';
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/DATABASE_URL=["']?([^"'\n\r]+)["']?/);
      if (match && match[1]) {
        url = match[1];
      }
    }
  } catch (err) {
    // fallback
  }
  if (!url) {
    url = process.env.DATABASE_URL || '';
  }
  return url.trim().replace(/^["']|["']$/g, '');
}

const connectionString = getDatabaseUrl();
const isLocalhost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

const pool = new Pool({
  connectionString,
  ssl: isLocalhost ? false : { rejectUnauthorized: false },
});

const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
  });

globalForPrisma.prisma = prisma;

