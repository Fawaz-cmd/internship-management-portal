import jwt from 'jsonwebtoken';
import type { Role } from '../constants/roles';
import { env } from '../config/env';

export type JwtPayload = {
  userId: string;
  role: Role;
  email: string;
};

export const signAccessToken = (payload: JwtPayload) => {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: '12h' });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
};
