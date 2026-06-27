import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { ROLES, type Role } from '../constants/roles';
import { signAccessToken } from '../utils/jwt';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

const roleEnum = z.enum([ROLES.ADMIN, ROLES.MENTOR, ROLES.TEAM_LEAD, ROLES.INTERN]);

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: roleEnum.default(ROLES.INTERN)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const authRateLimit = rateLimit({
  windowMs: 60_000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests' }
});

router.post('/bootstrap-admin', async (req, res) => {
  const usersCount = await prisma.user.count();

  if (usersCount > 0) {
    return res.status(400).json({ message: 'Bootstrap already completed' });
  }

  const parsed = registerSchema.safeParse({ ...req.body, role: ROLES.ADMIN });
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.flatten() });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: ROLES.ADMIN
    }
  });

  const token = signAccessToken({ userId: user.id, role: user.role as Role, email: user.email });
  return res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

router.post('/register', authRateLimit, authenticate, authorize(ROLES.ADMIN), async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.flatten() });
  }

  const existingUser = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existingUser) {
    return res.status(409).json({ message: 'Email already in use' });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: parsed.data.role
    }
  });

  return res.status(201).json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
});

router.post('/login', authRateLimit, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.flatten() });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = signAccessToken({ userId: user.id, role: user.role as Role, email: user.email });

  return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

export default router;
