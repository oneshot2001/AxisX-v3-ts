/**
 * Dahua product scraper
 * Target: dahuasecurity.com/Products
 * Method: cheerio (static HTML)
 */

import { BaseScraper } from './base.js';
import type { ScrapedProduct } from './types.js';

export class DahuaScraper extends BaseScraper {
  constructor() {
    super({
      name: 'dahua',
      manufacturer: 'Dahua',
      baseUrl: 'https://www.dahuasecurity.com/Products/',
      rateLimit: 6,
      method: 'cheerio',
      timeout: 15000,
      retries: 3,
    });
  }

  async scrape(): Promise<ScrapedProduct[]> {
    const products: ScrapedProduct[] = [];

    const categoryUrls = [
      'IP-Camera',
      'PTZ-Camera',
      'Panoramic-Camera',
      'Thermal-Camera',
    ];

    for (const category of categoryUrls) {
      try {
        const url = this.config.baseUrl + category;
        const html = await this.fetch(url);
        const $ = this.parseHtml(html);

        $('[class*="product"], .pro-item, .camera-item').each((_i: number, el: any) => {
          const $el = $(el);
          const model = $el.find('[class*="model"], [class*="name"], h3, h4').first().text().trim();
          const description = $el.find('[class*="desc"], [class*="info"], p').first().text().trim();
          const link = $el.find('a').first().attr('href') ?? '';

          if (!model || !model.match(/^(DH-|IPC-|SD-)/i)) return;

          products.push({
            model,
            manufacturer: 'Dahua',
            type: this.normalizeType(this.inferType(model, description)),
            resolution: this.normalizeResolution(this.inferResolution(description)),
            features: this.extractFeatures(description),
            url: link.startsWith('http') ? link : `https://www.dahuasecurity.com${link}`,
          });
        });
      } catch {
        // Non-fatal
      }
    }

    return products;
  }

  private inferType(model: string, desc: string): string {
    const combined = `${model} ${desc}`.toLowerCase();
    if (combined.includes('ptz') || combined.includes('sd-')) return 'PTZ';
    if (combined.includes('bullet')) return 'Bullet';
    if (combined.includes('turret') || combined.includes('eyeball')) return 'Turret';
    if (combined.includes('dome')) return 'Dome';
    if (combined.includes('panoramic')) return 'Panoramic';
    if (combined.includes('thermal')) return 'Thermal';
    if (combined.includes('fisheye')) return 'Fisheye';
    return 'Camera';
  }

  private inferResolution(desc: string): string {
    const lower = desc.toLowerCase();
    if (lower.includes('8mp') || lower.includes('4k')) return '4K';
    if (lower.includes('5mp')) return '5MP';
    if (lower.includes('4mp')) return '4MP';
    if (lower.includes('2mp') || lower.includes('1080p')) return '1080p';
    return '1080p';
  }

  private extractFeatures(desc: string): string[] {
    const features: string[] = [];
    const lower = desc.toLowerCase();
    if (lower.includes('wizmind')) features.push('WizMind');
    if (lower.includes('wizsense')) features.push('WizSense');
    if (lower.includes('wizcolor') || lower.includes('full-color')) features.push('Full-Color');
    if (lower.includes('tioc')) features.push('TiOC');
    if (lower.includes('ir')) features.push('IR');
    if (lower.includes('wdr')) features.push('WDR');
    if (lower.includes('ai')) features.push('AI');
    if (lower.includes('ip67')) features.push('IP67');
    if (lower.includes('ik10')) features.push('IK10');
    return features;
  }
}
