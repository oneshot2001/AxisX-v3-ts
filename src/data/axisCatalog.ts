/**
 * Axis Camera Catalog 2026
 *
 * Static catalog data derived from axis_camera_catalog_2026.json (scraped Jan 2026).
 * Organized by category and series for the Axis Browse portfolio view.
 *
 * Model strings match the format used by VERIFIED_URLS and axis_msrp_data.json
 * (e.g., "P3265-LVE" not "AXIS P3265-LVE") for runtime MSRP/URL enrichment.
 */

// =============================================================================
// TYPES
// =============================================================================

export interface CatalogSeries {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly models: readonly string[];
}

export interface CatalogCategory {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly series: readonly CatalogSeries[];
}

// =============================================================================
// CATALOG DATA
// =============================================================================

export const AXIS_CATALOG: readonly CatalogCategory[] = [
  // -------------------------------------------------------------------------
  // DOME CAMERAS
  // -------------------------------------------------------------------------
  {
    id: 'dome',
    label: 'Dome Cameras',
    description: 'Discreet and solid in any environment',
    series: [
      {
        id: 'M30',
        label: 'M30 Series',
        description: 'Affordable mini domes',
        models: ['M3085-V', 'M3086-V', 'M3087-V', 'M3088-V', 'M3085-VE'],
      },
      {
        id: 'M31',
        label: 'M31 Series',
        description: 'Affordable flat-faced domes',
        models: ['M3115-LVE', 'M3116-LVE', 'M3126-LVE'],
      },
      {
        id: 'M32',
        label: 'M32 Series',
        description: 'All-around fixed focal domes',
        models: ['M3215-LVE', 'M3216-LVE'],
      },
      {
        id: 'M42',
        label: 'M42 Series',
        description: 'Affordable AI-powered varifocal domes',
        models: [
          'M4215-LV', 'M4215-V', 'M4216-LV', 'M4216-V',
          'M4218-LV', 'M4218-V', 'M4225-LVE', 'M4226-LVE', 'M4228-LVE',
        ],
      },
      {
        id: 'M43',
        label: 'M43 Series',
        description: 'Eagle-eyed intelligence (panoramic domes)',
        models: ['M4308-PLE', 'M4317-PLVE', 'M4318-PLVE'],
      },
      {
        id: 'P32',
        label: 'P32 Series',
        description: 'Versatile AI-powered domes (ARTPEC-9)',
        models: [
          'P3268-SLVE',
          'P3275-LV', 'P3275-LVE', 'P3277-LV', 'P3277-LVE',
          'P3278-LV', 'P3278-LVE', 'P3285-LV', 'P3285-LVE',
          'P3287-LV', 'P3287-LVE', 'P3288-LV', 'P3288-LVE',
        ],
      },
      {
        id: 'P39',
        label: 'P39 Series',
        description: 'High-performance onboard domes',
        models: ['P3925-R', 'P3935-LR', 'P3925-LRE', 'P3935-LRE'],
      },
      {
        id: 'Q35',
        label: 'Q35 Series',
        description: 'AI-powered unmatched performance (ARTPEC-9)',
        models: ['Q3538-SLVE', 'Q3546-LVE', 'Q3548-LVE', 'Q3556-LVE', 'Q3558-LVE'],
      },
      {
        id: 'Q36',
        label: 'Q36 Series',
        description: 'Advanced with remote adjustment',
        models: ['Q3626-VE', 'Q3628-VE'],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // BULLET CAMERAS
  // -------------------------------------------------------------------------
  {
    id: 'bullet',
    label: 'Bullet Cameras',
    description: 'For all purposes in any environment',
    series: [
      {
        id: 'M20',
        label: 'M20 Series',
        description: 'Affordable fixed-focal bullets',
        models: ['M2035-LE', 'M2036-LE'],
      },
      {
        id: 'P14',
        label: 'P14 Series',
        description: 'Varifocal multi-purpose bullets (ARTPEC-9)',
        models: [
          'P1455-LE', 'P1465-LE', 'P1465-LE-3', 'P1467-LE', 'P1468-LE',
          'P1475-LE', 'P1485-LE', 'P1487-LE', 'P1488-LE',
        ],
      },
      {
        id: 'Q18',
        label: 'Q18 Series',
        description: 'Next-generation bullets',
        models: ['Q1786-LE', 'Q1795-LE', 'Q1796-LE', 'Q1798-LE'],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // BOX CAMERAS
  // -------------------------------------------------------------------------
  {
    id: 'box',
    label: 'Box Cameras',
    description: 'Deterrence in any environment',
    series: [
      {
        id: 'M10',
        label: 'M10 Series',
        description: 'Affordable compact box',
        models: ['M1075-L', 'M1055-L'],
      },
      {
        id: 'M11',
        label: 'M11 Series',
        description: 'Affordable flexible box',
        models: ['M1135', 'M1137', 'M1135-E', 'M1137-E'],
      },
      {
        id: 'P13',
        label: 'P13 Series',
        description: 'Flexible multi-purpose box',
        models: [
          'P1385', 'P1387', 'P1388',
          'P1385-E', 'P1387-E', 'P1388-E',
          'P1385-LE', 'P1387-LE', 'P1388-LE',
        ],
      },
      {
        id: 'P15',
        label: 'P15 Series',
        description: 'Dual-sensor wide-angle + close-up',
        models: ['P1515', 'P1518-LE'],
      },
      {
        id: 'Q16',
        label: 'Q16 Series',
        description: 'Outstanding flexible box',
        models: ['Q1615', 'Q1645', 'Q1647', 'Q1656', 'Q1656-LE'],
      },
      {
        id: 'Q17',
        label: 'Q17 Series',
        description: 'High-performance box',
        models: ['Q1715', 'Q1728', 'Q1728-LE', 'Q1765-LE', 'Q1785-LE'],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // PTZ CAMERAS
  // -------------------------------------------------------------------------
  {
    id: 'ptz',
    label: 'PTZ Cameras',
    description: 'Pan, tilt, and zoom for wide-area coverage',
    series: [
      {
        id: 'M50',
        label: 'M50 Series',
        description: 'Compact indoor PTZ',
        models: ['M5000', 'M5000-G', 'M5013', 'M5014', 'M5525-E'],
      },
      {
        id: 'P56',
        label: 'P56 Series',
        description: 'Versatile high-performance PTZ',
        models: ['P5654-E', 'P5655-E', 'P5654-E Mk II'],
      },
      {
        id: 'Q60',
        label: 'Q60 Series',
        description: 'Robust mission-critical PTZ',
        models: ['Q6074', 'Q6075', 'Q6074-E', 'Q6075-E', 'Q6078-E', 'Q6135-LE'],
      },
      {
        id: 'Q61',
        label: 'Q61 Series',
        description: 'See above horizon PTZ',
        models: ['Q6155-E'],
      },
      {
        id: 'Q62',
        label: 'Q62 Series',
        description: 'Heavy-duty OptimizedIR PTZ',
        models: ['Q6215-LE'],
      },
      {
        id: 'Q63',
        label: 'Q63 Series',
        description: 'High-end AI-powered outdoor PTZ (ARTPEC-9)',
        models: ['Q6315-LE', 'Q6318-LE', 'Q6355', 'Q6358'],
      },
      {
        id: 'V59',
        label: 'V59 Series',
        description: 'Live streaming cameras',
        models: ['V5914', 'V5915'],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // PANORAMIC CAMERAS
  // -------------------------------------------------------------------------
  {
    id: 'panoramic',
    label: 'Panoramic Cameras',
    description: 'Complete situational awareness with one camera',
    series: [
      {
        id: 'P37',
        label: 'P37 Series',
        description: 'Flexible multidirectional',
        models: ['P3717-PLE', 'P3719-PLE', 'P3735-PLE', 'P3737-PLE', 'P3738-PLE'],
      },
      {
        id: 'P47',
        label: 'P47 Series',
        description: 'See in two directions',
        models: ['P4705-PLVE', 'P4707-PLVE'],
      },
      {
        id: 'panoramic-ptz',
        label: 'Multidirectional with PTZ',
        description: 'Panoramic overview with PTZ detail',
        models: ['Q6000-E', 'Q6100-E'],
      },
      {
        id: 'multisensor',
        label: 'Multisensor',
        description: 'High-resolution panoramic coverage',
        models: ['P3807-PVE', 'P3827-PVE'],
      },
      {
        id: 'single-sensor-pano',
        label: 'Single Sensor Panoramic',
        description: 'Compact panoramic surveillance',
        models: ['M3057-PLVE', 'M3067-P', 'M3068-P', 'M3077-PLVE'],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // MODULAR CAMERAS
  // -------------------------------------------------------------------------
  {
    id: 'modular',
    label: 'Modular Cameras',
    description: 'Flexible system for high level of discretion',
    series: [
      {
        id: 'F-main',
        label: 'F Series Main Units',
        description: 'Completely modular main units',
        models: ['F9104-B', 'F9111', 'F9111-B', 'F9114', 'F9114-B', 'F9124'],
      },
      {
        id: 'F-sensors',
        label: 'F Series Sensors',
        description: 'Modular sensor units',
        models: ['F2105-RE', 'F2115-R', 'F2135-RE', 'F4005-E', 'F4105-LRE', 'F4108'],
      },
      {
        id: 'P12',
        label: 'P12 Series',
        description: 'Compact discreet indoor modular',
        models: ['P1244', 'P1245-E', 'P1245 Mk II'],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // THERMAL CAMERAS
  // -------------------------------------------------------------------------
  {
    id: 'thermal',
    label: 'Thermal Cameras',
    description: 'Temperature monitoring and heat-based detection',
    series: [
      {
        id: 'Q19',
        label: 'Q19 Series',
        description: 'Perimeter protection and temperature monitoring',
        models: ['Q1961-TE', 'Q1961-XTE'],
      },
      {
        id: 'Q21',
        label: 'Q21 Series',
        description: 'Outstanding thermal imaging',
        models: ['Q2101-TE', 'Q2112-E'],
      },
      {
        id: 'Q87',
        label: 'Q87 Series',
        description: 'Bispectral PTZ (thermal + visual)',
        models: ['Q8752-E Mk II'],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // SPECIALTY CAMERAS
  // -------------------------------------------------------------------------
  {
    id: 'specialty',
    label: 'Specialty Cameras',
    description: 'For unique needs and scenarios',
    series: [
      {
        id: 'specialty-models',
        label: 'Specialty Models',
        description: 'Purpose-built for specific environments',
        models: ['P9117-PV', 'Q9216-SLV', 'Q9227-SLV', 'Q9307-LV'],
      },
    ],
  },
] as const;

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Get total model count across all categories and series.
 */
export function getCatalogModelCount(): number {
  let count = 0;
  for (const category of AXIS_CATALOG) {
    for (const series of category.series) {
      count += series.models.length;
    }
  }
  return count;
}
