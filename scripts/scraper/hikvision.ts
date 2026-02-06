/**
 * Hikvision product scraper
 * Target: hikvision.com/us-en/products/
 * Method: cheerio (static HTML)
 */

import { BaseScraper } from './base.js';
import type { ScrapedProduct } from './types.js';

export class HikvisionScraper extends BaseScraper {
  constructor() {
    super({
      name: 'hikvision',
      manufacturer: 'Hikvision',
      baseUrl: 'https://www.hikvision.com/us-en/products/',
      rateLimit: 6,
      method: 'cheerio',
      timeout: 15000,
      retries: 3,
    });
  }

  async scrape(): Promise<ScrapedProduct[]> {
    const products: ScrapedProduct[] = [];

    // Hikvision organizes products by category
    const categoryUrls = [
      'network-camera/pro-series-easyip/',
      'network-camera/deepinview/',
      'network-camera/ultra-series/',
      'network-camera/value-series/',
    ];

    for (const category of categoryUrls) {
      try {
        const url = this.config.baseUrl + category;
        const html = await this.fetch(url);
        const $ = this.parseHtml(html);

        // Hikvision uses product cards in grid layouts
        $('[class*="product-card"], [class*="product-item"], .pro-item').each((_i: number, el: any) => {
          const $el = $(el);
          const model = $el.find('[class*="model"], [class*="title"], h3, h4').first().text().trim();
          const description = $el.find('[class*="desc"], p').first().text().trim();
          const link = $el.find('a').first().attr('href') ?? '';

          if (!model || !model.match(/^(DS-|iDS-)/i)) return;

          const type = this.inferType(model, description);
          const resolution = this.inferResolution(model, description);
          const features = this.extractFeatures(description);

          products.push({
            model,
            manufacturer: 'Hikvision',
            type: this.normalizeType(type),
            resolution: this.normalizeResolution(resolution),
            features,
            url: link.startsWith('http') ? link : `https://www.hikvision.com${link}`,
          });
        });
      } catch {
        // Individual category failures are non-fatal
      }
    }

    return products;
  }

  private inferType(model: string, desc: string): string {
    const combined = `${model} ${desc}`.toLowerCase();
    if (combined.includes('ptz') || combined.includes('speed dome')) return 'PTZ';
    if (combined.includes('bullet')) return 'Bullet';
    if (combined.includes('turret')) return 'Turret';
    if (combined.includes('dome')) return 'Dome';
    if (combined.includes('panoramic') || combined.includes('panovu')) return 'Panoramic';
    if (combined.includes('thermal')) return 'Thermal';
    if (combined.includes('fisheye')) return 'Fisheye';
    if (combined.includes('box') || combined.includes('cube')) return 'Box';
    return 'Camera';
  }

  private inferResolution(model: string, desc: string): string {
    const combined = `${model} ${desc}`.toLowerCase();
    if (combined.includes('8mp') || combined.includes('4k')) return '4K';
    if (combined.includes('6mp')) return '6MP';
    if (combined.includes('5mp')) return '5MP';
    if (combined.includes('4mp')) return '4MP';
    if (combined.includes('3mp')) return '3MP';
    if (combined.includes('2mp') || combined.includes('1080p')) return '1080p';
    return '1080p'; // default
  }

  private extractFeatures(desc: string): string[] {
    const features: string[] = [];
    const lower = desc.toLowerCase();
    if (lower.includes('acusense')) features.push('AcuSense');
    if (lower.includes('colorvu')) features.push('ColorVu');
    if (lower.includes('darkfighter')) features.push('DarkFighter');
    if (lower.includes('smart hybrid light')) features.push('Smart Hybrid Light');
    if (lower.includes('ir')) features.push('IR');
    if (lower.includes('wdr')) features.push('WDR');
    if (lower.includes('ai')) features.push('AI');
    if (lower.includes('ip67')) features.push('IP67');
    if (lower.includes('ik10')) features.push('IK10');
    if (lower.includes('poe')) features.push('PoE');
    return features;
  }
}
