import { Request, Response } from 'express';
import { urlhausService } from '../services/urlhausService';
import { cacheService } from '../utils/redis';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApiResponse, RecentUrlItem, UrlDetail } from '../types';

export class URLhausController {
  async getRecentUrls(req: AuthenticatedRequest, res: Response) {
    try {
      const { authKey } = req.user!;
      const limit = parseInt(req.query.limit as string) || 20;
      
      // Check cache first
      const cacheKey = `recent_urls_${limit}`;
      const cached = await cacheService.get<RecentUrlItem[]>(cacheKey);
      
      if (cached) {
        return res.json({
          success: true,
          data: cached,
          cached: true,
          timestamp: new Date().toISOString()
        });
      }

      // Fetch from URLhaus API
      const urls = await urlhausService.getRecentUrls(authKey, limit);
      
      // Cache for 5 minutes
      await cacheService.set(cacheKey, urls, 300000);
      
      res.json({
        success: true,
        data: urls,
        cached: false,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Get recent URLs error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch recent URLs'
      });
    }
  }

  async searchUrl(req: AuthenticatedRequest, res: Response) {
    try {
      const { authKey } = req.user!;
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({
          success: false,
          error: 'URL is required'
        });
      }

      // Check cache first
      const cacheKey = `url_search_${url}`;
      const cached = await cacheService.get<UrlDetail>(cacheKey);
      
      if (cached) {
        return res.json({
          success: true,
          data: cached,
          cached: true,
          timestamp: new Date().toISOString()
        });
      }

      // Search in URLhaus API
      const result = await urlhausService.searchUrl(authKey, url);
      
      // Cache for 1 hour
      await cacheService.set(cacheKey, result, 3600000);
      
      res.json({
        success: true,
        data: result,
        cached: false,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Search URL error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to search URL'
      });
    }
  }

  async searchHost(req: AuthenticatedRequest, res: Response) {
    try {
      const { authKey } = req.user!;
      const { host } = req.body;
      
      if (!host) {
        return res.status(400).json({
          success: false,
          error: 'Host is required'
        });
      }

      // Check cache first
      const cacheKey = `host_search_${host}`;
      const cached = await cacheService.get<RecentUrlItem[]>(cacheKey);
      
      if (cached) {
        return res.json({
          success: true,
          data: cached,
          cached: true,
          timestamp: new Date().toISOString()
        });
      }

      // Search in URLhaus API
      const results = await urlhausService.searchHost(authKey, host);
      
      // Cache for 1 hour
      await cacheService.set(cacheKey, results, 3600000);
      
      res.json({
        success: true,
        data: results,
        cached: false,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Search host error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to search host'
      });
    }
  }

  async getUrlDetail(req: AuthenticatedRequest, res: Response) {
    try {
      const { authKey } = req.user!;
      const { url } = req.params;
      
      if (!url) {
        return res.status(400).json({
          success: false,
          error: 'URL is required'
        });
      }

      // Check cache first
      const cacheKey = `url_detail_${url}`;
      const cached = await cacheService.get<UrlDetail>(cacheKey);
      
      if (cached) {
        return res.json({
          success: true,
          data: cached,
          cached: true,
          timestamp: new Date().toISOString()
        });
      }

      // Get details from URLhaus API
      const detail = await urlhausService.getUrlDetail(authKey, url);
      
      // Cache for 1 hour
      await cacheService.set(cacheKey, detail, 3600000);
      
      res.json({
        success: true,
        data: detail,
        cached: false,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Get URL detail error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get URL details'
      });
    }
  }

  async clearCache(req: Request, res: Response) {
    try {
      await cacheService.flush();
      res.json({
        success: true,
        message: 'Cache cleared successfully'
      });
    } catch (error: any) {
      console.error('Clear cache error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to clear cache'
      });
    }
  }
}

export const urlhausController = new URLhausController();
