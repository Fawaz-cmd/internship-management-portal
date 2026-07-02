import type { NextFunction, Request, Response } from 'express';
import type { Role } from '../constants/roles';
import { canAccess } from '../utils/rbac';

export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!canAccess(req.user.role, allowedRoles)) {
      return res.status(403).json({ message: 'Forbidden for your role' });
    }

    return next();
  };
};
