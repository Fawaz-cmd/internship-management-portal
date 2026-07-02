import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { ROLES } from '../constants/roles';

const router = Router();

const createProjectSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  mentorId: z.string().uuid().optional(),
  teamLeadId: z.string().uuid().optional()
});

const addMemberSchema = z.object({
  userId: z.string().uuid()
});

const projectRateLimit = rateLimit({
  windowMs: 60_000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests' }
});

router.get('/', projectRateLimit, authenticate, async (_req, res) => {
  const projects = await prisma.internship.findMany({
    include: {
      mentor: { select: { id: true, name: true, email: true } },
      teamLead: { select: { id: true, name: true, email: true } },
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, role: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return res.json({ projects });
});

router.post(
  '/',
  projectRateLimit,
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MENTOR, ROLES.TEAM_LEAD),
  async (req, res) => {
    const parsed = createProjectSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.flatten() });
    }

    const project = await prisma.internship.create({
      data: {
        ...parsed.data,
        createdById: req.user!.userId
      }
    });

    return res.status(201).json({ project });
  }
);

router.post(
  '/:internshipId/members',
  projectRateLimit,
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MENTOR, ROLES.TEAM_LEAD),
  async (req, res) => {
    const body = addMemberSchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({ message: body.error.flatten() });
    }

    const internshipId = z.string().uuid().safeParse(req.params.internshipId);
    if (!internshipId.success) {
      return res.status(400).json({ message: 'Invalid internship id' });
    }

    const membership = await prisma.internshipMember.upsert({
      where: { internshipId_userId: { internshipId: internshipId.data, userId: body.data.userId } },
      create: { internshipId: internshipId.data, userId: body.data.userId },
      update: {}
    });

    return res.status(201).json({ membership });
  }
);

export default router;
