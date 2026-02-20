// Reclassify 25 camera models that returned HTTP 404 on Axis.com
// These are modular sensor units, body-worn cameras, and specialty products
// that don't have standard product pages and cannot be scraped.
const { readFileSync, writeFileSync } = require('fs');
const { resolve } = require('path');

const SPEC_PATH = resolve(__dirname, '../src/data/axis_spec_data.json');
const data = JSON.parse(readFileSync(SPEC_PATH, 'utf8'));
const products = data.products;

// F-series: Modular camera sensor units (not standalone cameras)
const fSeriesSensorUnits = [
  'F2105-RE-STANDARD',
  'F2107-RE-STANDARD',
  'F2108-STANDARD',
  'F2115-R-VARIFOCAL',
  'F2135-RE-FISHEYE',
  'F2137-RE-FISHEYE',
  'F4105-LRE',
  'F4105-SLRE',
  'F4108',
  'F7225-RE-PINHOLE',
];

const fSeriesMainUnits = [
  'F9104-B-MK-II',
  'F9111-R-MK-II',
  'F9114-B-MK-II',
  'F9114-R-MK-II',
];

const fSeriesAccessories = [
  'F92A01-HEIGHT-STRIP',
];

// FA-series: Also sensor units or modular accessories
const faSensorUnits = [
  'FA1105',
  'FA1125',
  'FA3105-L-EYEBALL',
  'FA4115',
  'FA51-B',
  'FA51',
];

// W-series: Body-worn cameras (different URL pattern, discontinued?)
const wSeries = [
  'W102',
  'W110',
  'W120',
];

// TW: Thermal wind turbine radar (specialty)
const specialty = [
  'TW1200',
];

let changed = 0;

// Reclassify F-series sensor units
for (const model of fSeriesSensorUnits) {
  if (products[model] && products[model].productType === 'camera') {
    products[model].productType = 'sensor-unit';
    products[model].cameraType = null;
    changed++;
    console.log(`  ${model}: camera → sensor-unit`);
  }
}

// F-series main units stay as cameras but need different URL pattern
// For now mark them as modular so they're skipped by the scraper
for (const model of fSeriesMainUnits) {
  if (products[model] && products[model].productType === 'camera') {
    products[model].productType = 'modular-host';
    products[model].cameraType = null;
    changed++;
    console.log(`  ${model}: camera → modular-host`);
  }
}

// F-series accessories
for (const model of fSeriesAccessories) {
  if (products[model] && products[model].productType === 'camera') {
    products[model].productType = 'accessory';
    products[model].cameraType = null;
    changed++;
    console.log(`  ${model}: camera → accessory`);
  }
}

// FA-series sensor units
for (const model of faSensorUnits) {
  if (products[model] && products[model].productType === 'camera') {
    products[model].productType = 'sensor-unit';
    products[model].cameraType = null;
    changed++;
    console.log(`  ${model}: camera → sensor-unit`);
  }
}

// W-series body-worn
for (const model of wSeries) {
  if (products[model] && products[model].productType === 'camera') {
    products[model].productType = 'body-worn';
    products[model].cameraType = null;
    changed++;
    console.log(`  ${model}: camera → body-worn`);
  }
}

// TW-series specialty
for (const model of specialty) {
  if (products[model] && products[model].productType === 'camera') {
    products[model].productType = 'radar';
    products[model].cameraType = null;
    changed++;
    console.log(`  ${model}: camera → radar`);
  }
}

writeFileSync(SPEC_PATH, JSON.stringify(data, null, 2) + '\n');

// Count remaining cameras
const cameraCount = Object.values(products).filter(p => p.productType === 'camera').length;
console.log(`\nReclassified ${changed} products. ${cameraCount} cameras remain.`);
