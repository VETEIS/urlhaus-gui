import { Router } from 'express';
import urlhausRoutes from './urlhaus';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'URLhaus Backend API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
router.use('/api/v1', urlhausRoutes);

export default router;
