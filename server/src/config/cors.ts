import { CorsOptions } from 'cors';

export const corsOptions: CorsOptions = {
  origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : '*',
  credentials: true,
  optionsSuccessStatus: 200,
};
