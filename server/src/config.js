import { z } from 'zod';

const environmentSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
  COOKIE_SECURE: z.enum(['true', 'false']).optional()
});

export function loadConfig(environment = process.env) {
  const result = environmentSchema.safeParse(environment);
  if (!result.success) {
    const details = result.error.issues.map(({ path, message }) => `${path.join('.')}: ${message}`).join('; ');
    throw new Error(`Invalid server configuration: ${details}`);
  }

  return {
    ...result.data,
    COOKIE_SECURE: result.data.COOKIE_SECURE === undefined
      ? result.data.NODE_ENV === 'production'
      : result.data.COOKIE_SECURE === 'true'
  };
}
