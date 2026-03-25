import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as unknown as { _dbClient: any };

function getClient() {
  if (g._dbClient) return g._dbClient;

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');

  const adapter = new PrismaPg({ connectionString: url });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  g._dbClient = new (PrismaClient as any)({ adapter });
  return g._dbClient;
}

export const prisma = new Proxy({} as InstanceType<typeof PrismaClient>, {
  get(_target, prop: string | symbol) {
    const client = getClient();
    const value = client[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});
