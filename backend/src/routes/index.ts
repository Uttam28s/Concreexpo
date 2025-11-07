import { Router } from 'express';
import authRoutes from './auth.routes';
import clientRoutes from './client.routes';
import engineerRoutes from './engineer.routes';
import materialRoutes from './material.routes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Concreexpo API is running' });
});

// Routes
router.use('/auth', authRoutes);
router.use('/clients', clientRoutes);
router.use('/engineers', engineerRoutes);
router.use('/materials', materialRoutes);

export default router;
