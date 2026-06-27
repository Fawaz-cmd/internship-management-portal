import type { Role } from '../constants/roles';

export const canAccess = (currentRole: Role, allowedRoles: Role[]) => {
  return allowedRoles.includes(currentRole);
};
