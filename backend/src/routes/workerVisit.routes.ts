import { Router } from 'express';
import {
  createVisit,
  submitWorkerCount,
  getPendingVisits,
  getCompletedVisits,
  getAllVisits,
  getEngineerSummary,
  getSiteWiseSummary,
  getDateWiseAnalysis,
} from '../controllers/workerVisit.controller';
import { authenticate, adminOnly, engineerOnly } from '../middleware/auth.middleware';

const router = Router();

// All worker visit routes require authentication
router.use(authenticate);

// Engineer routes
router.post('/', engineerOnly, createVisit);
router.post('/:id/submit-count', engineerOnly, submitWorkerCount);
router.get('/pending', engineerOnly, getPendingVisits);

// Shared routes (role-based access inside controller)
router.get('/completed', getCompletedVisits);

// Admin routes
router.get('/all', adminOnly, getAllVisits);
router.get('/reports/engineer-summary', adminOnly, getEngineerSummary);
router.get('/reports/site-wise', adminOnly, getSiteWiseSummary);
router.get('/reports/date-wise', adminOnly, getDateWiseAnalysis);

export default router;
