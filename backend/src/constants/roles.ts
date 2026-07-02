export const ROLES = {
  ADMIN: 'ADMIN',
  MENTOR: 'MENTOR',
  TEAM_LEAD: 'TEAM_LEAD',
  INTERN: 'INTERN'
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
