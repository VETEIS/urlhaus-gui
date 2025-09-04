import axios, { AxiosInstance } from 'axios';
import { RecentUrlItem, UrlDetail } from '../types';

export class URLhausService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.URLHAUS_API_URL || 'https://urlhaus-api.abuse.ch',
      timeout: parseInt(process.env.URLHAUS_API_TIMEOUT || '30000'),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  async getRecentUrls(authKey: string, limit: number = 20): Promise<RecentUrlItem[]> {
    try {
      const response = await this.api.get('/api/v1/urls/recent/', {
        headers: { 'Auth-Key': authKey },
        params: { limit }
      });

      return response.data.urls || [];
    } catch (error) {
      console.error('URLhaus API error (recent URLs):', error);
      throw new Error('Failed to fetch recent URLs from URLhaus API');
    }
  }

  async searchUrl(authKey: string, url: string): Promise<UrlDetail> {
    try {
      const body = new URLSearchParams();
      body.set('url', url);

      const response = await this.api.post('/api/v1/url/', body, {
        headers: { 'Auth-Key': authKey }
      });

      return response.data;
    } catch (error) {
      console.error('URLhaus API error (URL search):', error);
      throw new Error('Failed to search URL in URLhaus API');
    }
  }

  async searchHost(authKey: string, host: string): Promise<RecentUrlItem[]> {
    try {
      const body = new URLSearchParams();
      body.set('host', host);

      const response = await this.api.post('/api/v1/host/', body, {
        headers: { 'Auth-Key': authKey }
      });

      return response.data.urls || [];
    } catch (error) {
      console.error('URLhaus API error (host search):', error);
      throw new Error('Failed to search host in URLhaus API');
    }
  }

  async getUrlDetail(authKey: string, url: string): Promise<UrlDetail> {
    try {
      const body = new URLSearchParams();
      body.set('url', url);

      const response = await this.api.post('/api/v1/url/', body, {
        headers: { 'Auth-Key': authKey }
      });

      return response.data;
    } catch (error) {
      console.error('URLhaus API error (URL detail):', error);
      throw new Error('Failed to get URL details from URLhaus API');
    }
  }
}

export const urlhausService = new URLhausService();
