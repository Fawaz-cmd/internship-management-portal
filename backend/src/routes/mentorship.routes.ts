import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { ROLES } from '../constants/roles';
import { rateLimit } from '../middleware/rateLimit';

const router = Router();

router.use(authenticate);
router.use(rateLimit(120, 60_000));

router.get('/my-internships', authorize(ROLES.MENTOR), async (req, res) => {
  const internships = await prisma.internship.findMany({
    where: { mentorId: req.user!.userId },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, role: true } }
        }
      }
    }
  });

  return res.json({ internships });
});

router.patch('/:internshipId/assign-mentor', authorize(ROLES.ADMIN, ROLES.TEAM_LEAD), async (req, res) => {
  const internshipId = z.string().uuid().safeParse(req.params.internshipId);
  const payload = z.object({ mentorId: z.string().uuid() }).safeParse(req.body);

  if (!internshipId.success || !payload.success) {
    return res.status(400).json({ message: 'Invalid payload' });
  }

  const internship = await prisma.internship.update({
    where: { id: internshipId.data },
    data: { mentorId: payload.data.mentorId }
  });

  return res.json({ internship });
});

export default router;
