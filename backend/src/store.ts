// backend/src/store.ts
import { logInfo, logDebug, logWarn } from './loggerClient';

export interface ShortUrl {
  id: string;
  originalUrl: string;
  shortcode: string;
  expiry: Date;
  createdAt: Date;
  clicks: number;
}

export class UrlStore {
  private urls = new Map<string, ShortUrl>();
  private clicks = new Map<string, number>();

  async create(shortUrl: ShortUrl): Promise<void> {
    this.urls.set(shortUrl.shortcode, shortUrl);
    this.clicks.set(shortUrl.shortcode, 0);
    
    await logInfo('db', 'Short URL created in store', {
      shortcode: shortUrl.shortcode,
      originalUrl: shortUrl.originalUrl,
      expiry: shortUrl.expiry.toISOString(),
      totalUrls: this.urls.size
    });
  }

  async getByShortcode(shortcode: string): Promise<ShortUrl | undefined> {
    const url = this.urls.get(shortcode);
    
    if (url) {
      await logDebug('db', 'Short URL found in store', {
        shortcode,
        originalUrl: url.originalUrl,
        clicks: url.clicks
      });
    } else {
      await logWarn('db', 'Short URL not found in store', { shortcode });
    }
    
    return url;
  }

  async incrementClick(shortcode: string): Promise<void> {
    const current = this.clicks.get(shortcode) || 0;
    const newCount = current + 1;
    this.clicks.set(shortcode, newCount);
    
    // Update the url record
    const url = this.urls.get(shortcode);
    if (url) {
      url.clicks = newCount;
      this.urls.set(shortcode, url);
      
      await logInfo('db', 'Click count incremented', {
        shortcode,
        newClickCount: newCount,
        originalUrl: url.originalUrl
      });
    } else {
      await logWarn('db', 'Attempted to increment clicks for non-existent URL', { shortcode });
    }
  }

  isExpired(shortUrl: ShortUrl): boolean {
    const expired = new Date() > shortUrl.expiry;
    
    if (expired) {
      logWarn('db', 'URL access attempted on expired URL', {
        shortcode: shortUrl.shortcode,
        expiry: shortUrl.expiry.toISOString(),
        originalUrl: shortUrl.originalUrl
      });
    }
    
    return expired;
  }

  async getAllStats(): Promise<ShortUrl[]> {
    const allUrls = Array.from(this.urls.values());
    
    await logDebug('db', 'Retrieved all URL statistics', {
      totalUrls: allUrls.length,
      totalClicks: allUrls.reduce((sum, url) => sum + url.clicks, 0)
    });
    
    return allUrls;
  }
}

export const urlStore = new UrlStore();
