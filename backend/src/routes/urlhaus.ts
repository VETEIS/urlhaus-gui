import { Router } from 'express';
import { urlhausController } from '../controllers/urlhausController';
import { authenticateApiKey } from '../middleware/auth';
import { urlhausRateLimit } from '../middleware/rateLimiter';

const router = Router();

// Apply rate limiting to all URLhaus routes
router.use(urlhausRateLimit);

// Recent URLs endpoint
router.get('/recent', authenticateApiKey, urlhausController.getRecentUrls);

// Search endpoints
router.post('/search/url', authenticateApiKey, urlhausController.searchUrl);
router.post('/search/host', authenticateApiKey, urlhausController.searchHost);

// URL detail endpoint
router.get('/detail/:url', authenticateApiKey, urlhausController.getUrlDetail);

// Cache management
router.post('/cache/clear', urlhausController.clearCache);

export default router;
