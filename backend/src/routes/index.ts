import { Router } from 'express';
import authRoutes from './auth.routes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// Routes
router.use('/auth', authRoutes);

export default router;
