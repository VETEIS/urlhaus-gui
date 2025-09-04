// Type definitions for the URLhaus backend API

export interface RecentUrlItem {
  url_id?: string;
  urlhaus_reference?: string;
  url: string;
  host?: string;
  url_status?: string;
  date_added?: string;
  tags?: string[];
  threat?: string;
}

export interface UrlDetail {
  query_status: string;
  id?: string;
  url: string;
  url_id?: string;
  url_status?: string;
  date_added?: string;
  last_online?: string | null;
  threat?: string;
  tags?: string[];
  blacklists?: Record<string, unknown>;
  reporter?: string;
  urlhaus_reference?: string;
  firstseen?: string;
  lastseen?: string;
  host?: string;
  larted?: string;
  takedown_time_seconds?: number | null;
  payloads?: Array<{
    firstseen?: string;
    filename?: string;
    file_type?: string;
    response_size?: string;
    response_md5?: string;
    response_sha256?: string;
    signature?: string;
    urlhaus_download?: string;
    virustotal?: {
      result?: string;
      percent?: string;
      link?: string;
    };
    imphash?: string;
    ssdeep?: string;
    tlsh?: string;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: number;
}

export interface User {
  id: string;
  email: string;
  apiKey: string;
  createdAt: Date;
  lastActive: Date;
}

export interface SearchHistory {
  id: string;
  userId: string;
  query: string;
  mode: 'url' | 'host';
  resultsCount: number;
  createdAt: Date;
}
