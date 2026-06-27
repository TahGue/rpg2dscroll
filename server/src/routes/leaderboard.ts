import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { prisma } from '../db.js';

const router = Router();

router.get('/:missionId', async (req, res) => {
  try {
    const { missionId } = req.params;
    const scores = await prisma.leaderboardScore.findMany({
      where: { missionId },
      orderBy: { score: 'desc' },
      take: 10,
      include: { user: { select: { email: true } } },
    });

    res.json({
      entries: scores.map((s, i) => ({
        rank: i + 1,
        email: s.user.email.replace(/(.{2}).*(@.*)/, '$1***$2'),
        score: s.score,
        date: s.createdAt,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load leaderboard' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const user = (req as typeof req & { user: { userId: string } }).user;
    const { missionId, score } = req.body as { missionId?: string; score?: number };

    if (!missionId || typeof score !== 'number') {
      res.status(400).json({ error: 'missionId and score required' });
      return;
    }

    const best = await prisma.leaderboardScore.findFirst({
      where: { userId: user.userId, missionId },
      orderBy: { score: 'desc' },
    });

    if (!best || score > best.score) {
      await prisma.leaderboardScore.create({
        data: { userId: user.userId, missionId, score },
      });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit score' });
  }
});

export default router;
