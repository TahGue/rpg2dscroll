import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import saveRoutes from './routes/save.js';
import leaderboardRoutes from './routes/leaderboard.js';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', game: 'Malik Desert Defense' });
});

app.use('/api/auth', authRoutes);
app.use('/api/save', saveRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

app.listen(PORT, () => {
  console.log(`Malik API running on http://localhost:${PORT}`);
});
