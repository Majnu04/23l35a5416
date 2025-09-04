// backend/src/store.ts
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

  create(shortUrl: ShortUrl): void {
    this.urls.set(shortUrl.shortcode, shortUrl);
    this.clicks.set(shortUrl.shortcode, 0);
  }

  getByShortcode(shortcode: string): ShortUrl | undefined {
    return this.urls.get(shortcode);
  }

  incrementClick(shortcode: string): void {
    const current = this.clicks.get(shortcode) || 0;
    this.clicks.set(shortcode, current + 1);
    
    // Update the url record
    const url = this.urls.get(shortcode);
    if (url) {
      url.clicks = current + 1;
      this.urls.set(shortcode, url);
    }
  }

  isExpired(shortUrl: ShortUrl): boolean {
    return new Date() > shortUrl.expiry;
  }

  getAllStats(): ShortUrl[] {
    return Array.from(this.urls.values());
  }
}

export const urlStore = new UrlStore();
