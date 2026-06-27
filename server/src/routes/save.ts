import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { prisma } from '../db.js';
import { DEFAULT_SAVE, mergeSaveData, type LocalSaveData } from '@malik/shared';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = (req as typeof req & { user: { userId: string } }).user;
    const save = await prisma.saveData.findUnique({ where: { userId: user.userId } });

    if (!save) {
      res.json({ save: DEFAULT_SAVE });
      return;
    }

    res.json({ save: mergeSaveData(JSON.parse(save.data) as Partial<LocalSaveData>) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load save' });
  }
});

router.put('/', authMiddleware, async (req, res) => {
  try {
    const user = (req as typeof req & { user: { userId: string } }).user;
    const { save } = req.body as { save?: LocalSaveData };

    if (!save) {
      res.status(400).json({ error: 'Save data required' });
      return;
    }

    await prisma.saveData.upsert({
      where: { userId: user.userId },
      create: { userId: user.userId, data: JSON.stringify(save) },
      update: { data: JSON.stringify(save) },
    });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save' });
  }
});

export default router;
