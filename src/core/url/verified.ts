/**
 * Verified URLs Table
 * 
 * These URLs have been verified to work on axis.com.
 * Add entries as you confirm URLs are correct.
 * 
 * Format: MODEL (normalized, no "AXIS" prefix) → Full URL
 * 
 * To add a new entry:
 * 1. Go to axis.com and find the product page
 * 2. Copy the URL
 * 3. Add entry: 'MODEL': 'https://www.axis.com/products/axis-model'
 * 
 * TODO: Build a script to auto-populate from MSRP data
 */

export const VERIFIED_URLS: Record<string, string> = {
  // ===========================================================================
  // P-SERIES (Network Cameras)
  // ===========================================================================
  
  // P32xx - Fixed Dome
  'P3245-LV': 'https://www.axis.com/products/axis-p3245-lv',
  'P3245-LVE': 'https://www.axis.com/products/axis-p3245-lve',
  'P3245-V': 'https://www.axis.com/products/axis-p3245-v',
  'P3245-VE': 'https://www.axis.com/products/axis-p3245-ve',
  'P3255-LVE': 'https://www.axis.com/products/axis-p3255-lve',
  'P3265-LV': 'https://www.axis.com/products/axis-p3265-lv',
  'P3265-LVE': 'https://www.axis.com/products/axis-p3265-lve',
  'P3265-V': 'https://www.axis.com/products/axis-p3265-v',
  'P3267-LV': 'https://www.axis.com/products/axis-p3267-lv',
  'P3267-LVE': 'https://www.axis.com/products/axis-p3267-lve',
  'P3268-LV': 'https://www.axis.com/products/axis-p3268-lv',
  'P3268-LVE': 'https://www.axis.com/products/axis-p3268-lve',
  'P3275-LV': 'https://www.axis.com/products/axis-p3275-lv',
  'P3275-LVE': 'https://www.axis.com/products/axis-p3275-lve',
  'P3275-V': 'https://www.axis.com/products/axis-p3275-v',
  
  // P14xx - Bullet
  'P1445-LE': 'https://www.axis.com/products/axis-p1445-le',
  'P1447-LE': 'https://www.axis.com/products/axis-p1447-le',
  'P1448-LE': 'https://www.axis.com/products/axis-p1448-le',
  'P1455-LE': 'https://www.axis.com/products/axis-p1455-le',
  'P1465-LE': 'https://www.axis.com/products/axis-p1465-le',
  'P1467-LE': 'https://www.axis.com/products/axis-p1467-le',
  'P1468-LE': 'https://www.axis.com/products/axis-p1468-le',
  'P1468-XLE': 'https://www.axis.com/products/axis-p1468-xle',
  
  // P37xx - Panoramic
  'P3715-PLVE': 'https://www.axis.com/products/axis-p3715-plve',
  'P3717-PLE': 'https://www.axis.com/products/axis-p3717-ple',
  'P3719-PLE': 'https://www.axis.com/products/axis-p3719-ple',
  
  // P55xx/P56xx - PTZ
  'P5534': 'https://www.axis.com/products/axis-p5534',
  'P5534-E': 'https://www.axis.com/products/axis-p5534-e',
  'P5635-E': 'https://www.axis.com/products/axis-p5635-e',
  'P5654-E': 'https://www.axis.com/products/axis-p5654-e',
  'P5655-E': 'https://www.axis.com/products/axis-p5655-e',

  // ===========================================================================
  // Q-SERIES (Professional/Premium)
  // ===========================================================================
  
  // Q35xx - Fixed Dome
  'Q3515-LV': 'https://www.axis.com/products/axis-q3515-lv',
  'Q3515-LVE': 'https://www.axis.com/products/axis-q3515-lve',
  'Q3517-LV': 'https://www.axis.com/products/axis-q3517-lv',
  'Q3517-LVE': 'https://www.axis.com/products/axis-q3517-lve',
  'Q3517-SLVE': 'https://www.axis.com/products/axis-q3517-slve',
  'Q3518-LVE': 'https://www.axis.com/products/axis-q3518-lve',
  'Q3536-LVE': 'https://www.axis.com/products/axis-q3536-lve',
  'Q3538-LVE': 'https://www.axis.com/products/axis-q3538-lve',
  'Q3538-SLVE': 'https://www.axis.com/products/axis-q3538-slve',
  
  // Q17xx - Bullet
  'Q1700-LE': 'https://www.axis.com/products/axis-q1700-le',
  'Q1785-LE': 'https://www.axis.com/products/axis-q1785-le',
  'Q1786-LE': 'https://www.axis.com/products/axis-q1786-le',
  'Q1798-LE': 'https://www.axis.com/products/axis-q1798-le',
  
  // Q60xx/Q61xx - PTZ
  'Q6010-E': 'https://www.axis.com/products/axis-q6010-e',
  'Q6074': 'https://www.axis.com/products/axis-q6074',
  'Q6074-E': 'https://www.axis.com/products/axis-q6074-e',
  'Q6075': 'https://www.axis.com/products/axis-q6075',
  'Q6075-E': 'https://www.axis.com/products/axis-q6075-e',
  'Q6075-S': 'https://www.axis.com/products/axis-q6075-s',
  'Q6075-SE': 'https://www.axis.com/products/axis-q6075-se',
  'Q6100-E': 'https://www.axis.com/products/axis-q6100-e',
  'Q6125-LE': 'https://www.axis.com/products/axis-q6125-le',
  'Q6135-LE': 'https://www.axis.com/products/axis-q6135-le',
  'Q6215-LE': 'https://www.axis.com/products/axis-q6215-le',
  'Q6225-LE': 'https://www.axis.com/products/axis-q6225-le',
  
  // ===========================================================================
  // M-SERIES (Compact/Mainstream)
  // ===========================================================================
  
  // M30xx - Compact Dome
  'M3085-V': 'https://www.axis.com/products/axis-m3085-v',
  'M3086-V': 'https://www.axis.com/products/axis-m3086-v',
  'M3087-PV': 'https://www.axis.com/products/axis-m3087-pv',
  'M3088-V': 'https://www.axis.com/products/axis-m3088-v',
  'M3115-LVE': 'https://www.axis.com/products/axis-m3115-lve',
  'M3116-LVE': 'https://www.axis.com/products/axis-m3116-lve',
  
  // M42xx - Compact Dome
  'M4215-LV': 'https://www.axis.com/products/axis-m4215-lv',
  'M4215-V': 'https://www.axis.com/products/axis-m4215-v',
  'M4216-LV': 'https://www.axis.com/products/axis-m4216-lv',
  'M4216-V': 'https://www.axis.com/products/axis-m4216-v',
  'M4218-LV': 'https://www.axis.com/products/axis-m4218-lv',
  'M4218-V': 'https://www.axis.com/products/axis-m4218-v',
  
  // M20xx - Bullet
  'M2035-LE': 'https://www.axis.com/products/axis-m2035-le',
  'M2036-LE': 'https://www.axis.com/products/axis-m2036-le',
  
  // ===========================================================================
  // F-SERIES (Modular)
  // ===========================================================================
  'F1015': 'https://www.axis.com/products/axis-f1015',
  'F1025': 'https://www.axis.com/products/axis-f1025',
  'F1035-E': 'https://www.axis.com/products/axis-f1035-e',
  'F34': 'https://www.axis.com/products/axis-f34',
  'F41': 'https://www.axis.com/products/axis-f41',
  'F44': 'https://www.axis.com/products/axis-f44',
  'FA1105': 'https://www.axis.com/products/axis-fa1105',
  'FA1125': 'https://www.axis.com/products/axis-fa1125',
  'FA3105-L': 'https://www.axis.com/products/axis-fa3105-l',
  'FA4115': 'https://www.axis.com/products/axis-fa4115',

  // ===========================================================================
  // SPECIALTY
  // ===========================================================================
  
  // Body Worn
  'W110': 'https://www.axis.com/products/axis-w110',
  'W120': 'https://www.axis.com/products/axis-w120',
  'W800': 'https://www.axis.com/products/axis-w800',
  
  // Thermal
  'Q1951-E': 'https://www.axis.com/products/axis-q1951-e',
  'Q1952-E': 'https://www.axis.com/products/axis-q1952-e',
  'Q1961-TE': 'https://www.axis.com/products/axis-q1961-te',
  'Q2901-E': 'https://www.axis.com/products/axis-q2901-e',
  
  // Explosion Protected
  'XP40-Q1765': 'https://www.axis.com/products/axis-xp40-q1765',
  'XP40-Q1785': 'https://www.axis.com/products/axis-xp40-q1785',
  
  // Door Stations
  'A8207-VE': 'https://www.axis.com/products/axis-a8207-ve',
  'A8207-VE-MK-II': 'https://www.axis.com/products/axis-a8207-ve-mk-ii',
  
  // ===========================================================================
  // ADD MORE VERIFIED URLS HERE
  // ===========================================================================
  // 
  // Tip: Export from MSRP data and verify in bulk
  // 
};

/**
 * Count of verified URLs (for debugging/stats)
 */
export const VERIFIED_URL_COUNT = Object.keys(VERIFIED_URLS).length;
