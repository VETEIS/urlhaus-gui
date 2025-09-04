import axios from 'axios';

export const createApiClient = (authKey: string | null) => {
  const instance = axios.create({
    baseURL: '/urlhaus',
    headers: authKey ? { 'Auth-Key': authKey } : {},
    timeout: 20000,
  });
  return instance;
};

export type RecentUrlItem = {
  url_id?: string;
  urlhaus_reference?: string;
  url: string;
  host?: string;
  url_status?: 'online' | 'offline' | string;
  date_added?: string;
  tags?: string[];
  threat?: string;
};

export type UrlDetail = {
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
};


