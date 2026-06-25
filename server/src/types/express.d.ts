import type { Role, User } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        roleKey: string;
        roleId: string;
        email: string;
      };

      currentUser?: User & {
        role: Role;
      };
    }
  }
}

export {};