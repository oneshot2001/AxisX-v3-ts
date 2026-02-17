/**
 * Axis Product Catalog 2026
 *
 * Static catalog data derived from axis_camera_catalog_2026.json (scraped Jan 2026)
 * and axis_spec_data.json (full portfolio including infrastructure products).
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
        models: ['M3085-V', 'M3086-V', 'M3088-V'],
      },
      {
        id: 'M31',
        label: 'M31 Series',
        description: 'Affordable flat-faced domes',
        models: ['M3125-LVE', 'M3126-LVE', 'M3128-LVE'],
      },
      {
        id: 'M32',
        label: 'M32 Series',
        description: 'All-around fixed focal domes',
        models: ['M3215-LVE', 'M3216-LVE'],
      },
      {
        id: 'M39',
        label: 'M39 Series',
        description: 'Rugged onboard dome',
        models: ['M3905-R'],
      },
      {
        id: 'M42',
        label: 'M42 Series',
        description: 'Affordable AI-powered varifocal domes',
        models: [
          'M4215-LV', 'M4215-V', 'M4216-LV', 'M4216-V',
          'M4218-LV', 'M4218-V', 'M4225-LVE', 'M4227-LVE', 'M4228-LVE',
        ],
      },
      {
        id: 'M43',
        label: 'M43 Series',
        description: 'Eagle-eyed intelligence (panoramic domes)',
        models: [
          'M4308-PLE', 'M4317-PLR', 'M4317-PLVE',
          'M4318-PLR', 'M4318-PLVE', 'M4327-P', 'M4328-P',
        ],
      },
      {
        id: 'P32',
        label: 'P32 Series',
        description: 'Versatile AI-powered domes (ARTPEC-8/9)',
        models: [
          'P3265-LV', 'P3265-LVE', 'P3265-LVE-3', 'P3265-V',
          'P3267-LVE', 'P3268-LV', 'P3268-LVE', 'P3268-SLVE',
          'P3275-LV', 'P3275-LVE', 'P3275-V',
          'P3277-LV', 'P3277-LVE',
          'P3278-LV', 'P3278-LVE',
          'P3285-LV', 'P3285-LVE',
          'P3287-LV', 'P3287-LVE',
          'P3288-LV', 'P3288-LVE',
        ],
      },
      {
        id: 'P39',
        label: 'P39 Series',
        description: 'High-performance onboard domes',
        models: ['P3905-R', 'P3925-LRE', 'P3925-R', 'P3935-LR'],
      },
      {
        id: 'Q35',
        label: 'Q35 Series',
        description: 'AI-powered unmatched performance (ARTPEC-9)',
        models: [
          'Q3536-LVE', 'Q3538-LVE', 'Q3538-SLVE',
          'Q3546-LVE', 'Q3548-LVE', 'Q3556-LVE', 'Q3558-LVE',
        ],
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
          'P1455-LE', 'P1455-LE-3', 'P1465-LE', 'P1465-LE-3',
          'P1467-LE', 'P1468-LE', 'P1468-XLE',
          'P1475-LE', 'P1485-LE', 'P1487-LE', 'P1488-LE',
        ],
      },
      {
        id: 'Q18',
        label: 'Q18 Series',
        description: 'High-performance AI-powered bullets (ARTPEC-9)',
        models: [
          'Q1800-LE', 'Q1800-LE-3', 'Q1805-LE',
          'Q1806-LE', 'Q1808-LE', 'Q1809-LE',
        ],
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
          'P1385', 'P1385-B', 'P1385-BE', 'P1385-E',
          'P1387', 'P1387-B', 'P1387-BE', 'P1387-LE',
          'P1388', 'P1388-B', 'P1388-BE', 'P1388-LE',
        ],
      },
      {
        id: 'P15',
        label: 'P15 Series',
        description: 'Dual-sensor wide-angle + close-up',
        models: ['P1518-E', 'P1518-LE'],
      },
      {
        id: 'Q16',
        label: 'Q16 Series',
        description: 'Outstanding flexible box',
        models: [
          'Q1615-LE', 'Q1656', 'Q1656-B', 'Q1656-BE',
          'Q1656-BLE', 'Q1656-DLE', 'Q1656-LE', 'Q1686-DLE',
        ],
      },
      {
        id: 'Q17',
        label: 'Q17 Series',
        description: 'High-performance box',
        models: ['Q1715', 'Q1726', 'Q1726-LE', 'Q1728', 'Q1728-LE'],
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
        models: ['M5000-G', 'M5074', 'M5075-G'],
      },
      {
        id: 'M55',
        label: 'M55 Series',
        description: 'High-performance outdoor PTZ',
        models: ['M5526-E'],
      },
      {
        id: 'P56',
        label: 'P56 Series',
        description: 'Versatile high-performance PTZ',
        models: ['P5654-E', 'P5655-E', 'P5676-LE'],
      },
      {
        id: 'Q60',
        label: 'Q60 Series',
        description: 'Robust mission-critical PTZ',
        models: [
          'Q6020-E', 'Q6074', 'Q6075', 'Q6074-E',
          'Q6075-E', 'Q6078-E', 'Q6086-E', 'Q6088-E', 'Q6135-LE',
        ],
      },
      {
        id: 'Q62',
        label: 'Q62 Series',
        description: 'Heavy-duty OptimizedIR PTZ',
        models: ['Q6225-LE'],
      },
      {
        id: 'Q63',
        label: 'Q63 Series',
        description: 'High-end AI-powered outdoor PTZ (ARTPEC-9)',
        models: [
          'Q6300-E', 'Q6315-LE', 'Q6318-LE',
          'Q6325-LE', 'Q6355-LE', 'Q6358-LE',
        ],
      },
      {
        id: 'V59',
        label: 'V59 Series',
        description: 'Live streaming cameras',
        models: ['V5925', 'V5938'],
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
        models: [
          'P3735-PLE', 'P3737-PLE', 'P3738-PLE',
          'P3747-PLVE', 'P3748-PLVE',
        ],
      },
      {
        id: 'P47',
        label: 'P47 Series',
        description: 'See in two directions',
        models: ['P4705-PLVE', 'P4707-PLVE', 'P4708-PLVE'],
      },
      {
        id: 'panoramic-ptz',
        label: 'Multidirectional with PTZ',
        description: 'Panoramic overview with PTZ detail',
        models: ['Q6100-E'],
      },
      {
        id: 'multisensor',
        label: 'Multisensor',
        description: 'High-resolution panoramic coverage',
        models: [
          'P3818-PVE', 'P3827-PVE',
          'Q3819-PVE', 'Q3839-PVE', 'Q3839-SPVE', 'Q4809-PVE',
        ],
      },
      {
        id: 'single-sensor-pano',
        label: 'Single Sensor Panoramic',
        description: 'Compact panoramic surveillance',
        models: ['M3057-PLR', 'M3077-PLVE'],
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
        models: ['F9104-B', 'F9111-R', 'F9114-B', 'F9114-R'],
      },
      {
        id: 'F-sensors',
        label: 'F Series Sensors',
        description: 'Modular sensor units',
        models: [
          'F2105-RE', 'F2107-RE', 'F2108', 'F2115-R',
          'F2135-RE', 'F2137-RE', 'F4105-LRE', 'F4105-SLRE',
          'F4108', 'F7225-RE',
        ],
      },
      {
        id: 'P12',
        label: 'P12 Series',
        description: 'Compact discreet indoor modular',
        models: ['P1245', 'P1265', 'P1275'],
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
        models: [
          'Q1941-E', 'Q1942-E', 'Q1951-E', 'Q1952-E',
          'Q1961-TE', 'Q1961-XTE', 'Q1971-E', 'Q1972-E',
        ],
      },
      {
        id: 'Q21',
        label: 'Q21 Series',
        description: 'Outstanding thermal imaging',
        models: ['Q2101-TE', 'Q2111-E', 'Q2112-E'],
      },
      {
        id: 'Q87',
        label: 'Q87 Series',
        description: 'Bispectral PTZ (thermal + visual)',
        models: ['Q8752-E'],
      },
      {
        id: 'Q86',
        label: 'Q86 Series',
        description: 'Bispectral PTZ cameras',
        models: [
          'Q8641-E', 'Q8642-E', 'Q8665-E', 'Q8665-LE',
          'Q8741-E', 'Q8741-LE', 'Q8742-E', 'Q8742-LE',
        ],
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

  // =========================================================================
  // INFRASTRUCTURE & NON-CAMERA PRODUCTS
  // =========================================================================

  // -------------------------------------------------------------------------
  // RECORDING SOLUTIONS
  // -------------------------------------------------------------------------
  {
    id: 'recorder',
    label: 'Recording Solutions',
    description: 'Network video recorders and storage',
    series: [
      {
        id: 'S12',
        label: 'S12 Series',
        description: 'Camera Station Pro recorders',
        models: [
          'S1216', 'S1224', 'S1228', 'S1232', 'S1264', 'S1296',
        ],
      },
      {
        id: 'S21',
        label: 'S21 Series',
        description: 'Compact desktop recorders',
        models: ['S2108'],
      },
      {
        id: 'S22',
        label: 'S22 Series',
        description: 'All-in-one recorders',
        models: ['S2208', 'S2212', 'S2216', 'S2224'],
      },
      {
        id: 'S30',
        label: 'S30 Series',
        description: 'Mini recorders',
        models: ['S3008', 'S3016'],
      },
      {
        id: 'S40',
        label: 'S40 Series',
        description: 'High-capacity storage',
        models: ['S4000'],
      },
      {
        id: 'S93',
        label: 'S93 Series',
        description: 'Audio management appliances',
        models: ['S9301', 'S9302'],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // NETWORK EQUIPMENT
  // -------------------------------------------------------------------------
  {
    id: 'networking',
    label: 'Network Equipment',
    description: 'PoE switches and media converters',
    series: [
      {
        id: 'D80',
        label: 'D80 Series',
        description: 'Compact industrial switches',
        models: ['D8004', 'D8208-R', 'D8248', 'D8308'],
      },
      {
        id: 'T85',
        label: 'T85 Series',
        description: 'PoE+ network switches',
        models: ['T8504-E', 'T8504-R', 'T8508', 'T8516', 'T8524'],
      },
      {
        id: 'T86',
        label: 'T86 Series',
        description: 'Media converters and switch accessories',
        models: ['T8604', 'T8606', 'T8611', 'T8612', 'T8613', 'T8640', 'T8645'],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // VIDEO ENCODERS
  // -------------------------------------------------------------------------
  {
    id: 'encoder',
    label: 'Video Encoders',
    description: 'Analog-to-IP video encoders',
    series: [
      {
        id: 'M71',
        label: 'M71 Series',
        description: 'Multi-channel video encoders',
        models: ['M7104', 'M7116'],
      },
      {
        id: 'P73',
        label: 'P73 Series',
        description: 'High-performance video encoders',
        models: ['P7304', 'P7316'],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // NETWORK AUDIO
  // -------------------------------------------------------------------------
  {
    id: 'audio',
    label: 'Network Audio',
    description: 'Speakers, amplifiers, and audio bridges',
    series: [
      {
        id: 'C10',
        label: 'C10 Series',
        description: 'Network cabinet speakers',
        models: ['C1004-E'],
      },
      {
        id: 'C11',
        label: 'C11 Series',
        description: 'Network ceiling speakers',
        models: ['C1110-E', 'C1111-E'],
      },
      {
        id: 'C12',
        label: 'C12 Series',
        description: 'Network ceiling speakers (compact)',
        models: ['C1210-E', 'C1211-E'],
      },
      {
        id: 'C13',
        label: 'C13 Series',
        description: 'Network pendant speakers',
        models: ['C1310-E'],
      },
      {
        id: 'C14',
        label: 'C14 Series',
        description: 'Network wall speakers',
        models: ['C1410'],
      },
      {
        id: 'C15',
        label: 'C15 Series',
        description: 'Network horn speakers',
        models: ['C1510', 'C1511'],
      },
      {
        id: 'C16',
        label: 'C16 Series',
        description: 'Network outdoor horn speakers',
        models: ['C1610-VE'],
      },
      {
        id: 'C17',
        label: 'C17 Series',
        description: 'Network audio amplifiers',
        models: ['C1710', 'C1720'],
      },
      {
        id: 'C61',
        label: 'C61 Series',
        description: 'Network audio bridge',
        models: ['C6110'],
      },
      {
        id: 'C70',
        label: 'C70 Series',
        description: 'Network PA system',
        models: ['C7050'],
      },
      {
        id: 'C8',
        label: 'C8 Series',
        description: 'Network microphones',
        models: ['C8110', 'C8210', 'C8310'],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // NETWORK INTERCOMS & DOOR STATIONS
  // -------------------------------------------------------------------------
  {
    id: 'intercom',
    label: 'Network Intercoms',
    description: 'Door stations, intercoms, and access hardware',
    series: [
      {
        id: 'A12',
        label: 'A12 Series',
        description: 'Network door stations',
        models: ['A1210', 'A1210-B', 'A1214'],
      },
      {
        id: 'A16',
        label: 'A16 Series',
        description: 'Network door controllers',
        models: ['A1601', 'A1610', 'A1610-B'],
      },
      {
        id: 'A17',
        label: 'A17 Series',
        description: 'Network door controllers (advanced)',
        models: ['A1710-B', 'A1711'],
      },
      {
        id: 'A18',
        label: 'A18 Series',
        description: 'Network door controllers (enterprise)',
        models: ['A1810-B', 'A1811'],
      },
      {
        id: 'I-series',
        label: 'I Series',
        description: 'Network intercoms and video intercoms',
        models: ['I5304', 'I7010-VE', 'I7020', 'I8016-LVE', 'I8116-E', 'I8307-VE'],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // MOUNTS & BRACKETS
  // -------------------------------------------------------------------------
  {
    id: 'mount',
    label: 'Mounts & Brackets',
    description: 'Camera mounting accessories',
    series: [
      {
        id: 'T91',
        label: 'T91 Series',
        description: 'Wall, pole, ceiling, and corner mounts',
        models: [
          'T91A23', 'T91A33', 'T91A64',
          'T91B47', 'T91B50', 'T91B51', 'T91B53', 'T91B57',
          'T91B63', 'T91B67',
          'T91D61', 'T91D62', 'T91F67',
          'T91G61', 'T91H61', 'T91R61',
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // RADAR DETECTION
  // -------------------------------------------------------------------------
  {
    id: 'radar',
    label: 'Radar Detection',
    description: 'Area protection and speed monitoring',
    series: [
      {
        id: 'D-indoor',
        label: 'D Series Indoor',
        description: 'Indoor area protection radar',
        models: ['D1110', 'D3110'],
      },
      {
        id: 'D-outdoor',
        label: 'D Series Outdoor',
        description: 'Outdoor area protection and speed radar',
        models: ['D2110-VE', 'D2122-VE', 'D2123-VE', 'D2210-VE', 'D4100-VE', 'D4200-VE'],
      },
      {
        id: 'D-air',
        label: 'D Series Airborne',
        description: 'Drone and airborne object detection',
        models: ['D6210', 'D6310'],
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
