import type { UserInstance } from '../database/models/User';

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        role: string;
      };
      currentUser?: UserInstance;
    }
  }
}

export {};
