import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string(),
  CLIENT_URL: z.string().optional(),
  // SePay bank transfer config
  SEPAY_ACCOUNT_NUMBER: z.string().default(''),
  SEPAY_BANK_CODE: z.string().default('MB'),
  SEPAY_API_TOKEN: z.string().default(''),
  SEPAY_ACCOUNT_NAME: z.string().default('CONG TY UTRAVEL'),
});

const env = envSchema.parse(process.env);

export default env;
