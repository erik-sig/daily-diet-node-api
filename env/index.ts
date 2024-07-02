/* eslint-disable prettier/prettier */
import { config } from 'dotenv';
import { z } from 'zod';

if (process.env.NODE_ENV === 'test') {
  console.log('testing envrionment');
  config({ path: '.env.test', override: true });
} else {
  config();
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
  DATABASE_URL: z.string(),
  DATABASE_CLIENT: z.enum(['sqlite', 'pg']),
  PORT: z.coerce.number().default(3333),
  SECRET: z.string(),
});

export const env = envSchema.parse(process.env);
