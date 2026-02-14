import { Config } from './types';

export const config: Config = {
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000',
  endpoint: '/agent/invoke',
};
