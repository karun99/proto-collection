import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = import.meta.env.VITE_DATABASE_URL;

if (!connectionString) {
  console.warn('VITE_DATABASE_URL is missing.');
}

const client = postgres(connectionString || '');
export const db = drizzle(client, { schema });
