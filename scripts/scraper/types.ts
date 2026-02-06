/**
 * Scraper type definitions
 */

export interface ScrapedProduct {
  model: string;
  manufacturer: string;
  type: string;
  resolution: string;
  features: string[];
  url: string;
  rawHtml?: string;
}

export interface ScraperConfig {
  name: string;
  manufacturer: string;
  baseUrl: string;
  rateLimit: number; // requests per minute
  method: 'cheerio' | 'puppeteer';
  timeout: number; // ms per request
  retries: number;
}

export interface ScrapeResult {
  manufacturer: string;
  products: ScrapedProduct[];
  errors: ScrapeError[];
  duration: number; // ms
  timestamp: string;
}

export interface ScrapeError {
  url: string;
  message: string;
  code?: string;
}

export interface MappedProduct {
  competitor_model: string;
  competitor_manufacturer: string;
  axis_replacement: string;
  axis_features: string[];
  match_confidence: number;
  competitor_type: string;
  competitor_resolution: string;
  notes: string;
}

export interface ValidationResult {
  valid: MappedProduct[];
  invalid: Array<{ product: MappedProduct | ScrapedProduct; reason: string }>;
  warnings: string[];
}

export interface PipelineOptions {
  manufacturers?: string[];
  dryRun: boolean;
  outputDir: string;
  verbose: boolean;
}
