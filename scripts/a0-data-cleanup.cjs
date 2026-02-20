/**
 * Task A0: Reclassify misclassified products in axis_spec_data.json
 *
 * - Reclassifies ~95 non-camera products from productType:'camera' to correct types
 * - Fixes cameraType for ~41 real cameras stuck as 'specialty'
 * - Writes updated axis_spec_data.json
 */
const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "../src/data/axis_spec_data.json");
const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
const products = data.products;

// ─── NON-CAMERA RECLASSIFICATIONS ────────────────────────────────────────────
// Map: modelKey → { productType, cameraType (removed) }

const reclassify = {
  // Lens
  "LENS-M12-28-MM-F12": { productType: "lens" },

  // Storage (SD cards)
  "SURVEILLANCE-CARD-1-TB": { productType: "storage" },
  "SURVEILLANCE-CARD-128-GB": { productType: "storage" },
  "SURVEILLANCE-CARD-256-GB": { productType: "storage" },
  "SURVEILLANCE-CARD-512-GB": { productType: "storage" },

  // Access control
  "TA1101-B": { productType: "access-control" },
  "TA4711-ACCESS": { productType: "access-control" },
  "TA4712-KEY-FOB": { productType: "access-control" },

  // Intercom enclosures
  "TA1201": { productType: "intercom" },
  "TA1202": { productType: "intercom" },
  "TA1203": { productType: "intercom" },

  // Networking / SFP modules
  "TD8901-SFP": { productType: "networking" },
  "TD8902-SFP": { productType: "networking" },
  "TD8911-SFP28": { productType: "networking" },
  "TD8912-SFP28": { productType: "networking" },

  // Audio
  "TC6901": { productType: "audio" },
  "TU1001-V": { productType: "audio" },
  "TU1001-VE": { productType: "audio" },
  "TU1002-VE": { productType: "audio" },
  "XC1311": { productType: "audio" },

  // Power (midspans, surge protectors, PoE extenders)
  "30-W": { productType: "power" },
  "90-W": { productType: "power" },
  "POE-MIDSPAN-8-PORT": { productType: "power" },
  "TD9301": { productType: "power" },
  "TU8001": { productType: "power" },
  "TU8002-E-90-W": { productType: "power" },
  "TU8003-90-W": { productType: "power" },
  "TU8004-90-W": { productType: "power" },
  "TU8010-2-PORT": { productType: "power" },
  "TU8011-4-PORT": { productType: "power" },

  // Mounts
  "TA8201": { productType: "mount" },
  "TI8202": { productType: "mount" },
  "TI8204": { productType: "mount" },
  "TI8602": { productType: "mount" },
  "TI8606-WEDGE": { productType: "mount" },
  "TM3101": { productType: "mount" },
  "TP1001-E": { productType: "mount" },
  "TP3004-E": { productType: "mount" },
  "TP3005-E": { productType: "mount" },
  "TP3101": { productType: "mount" },
  "TP3301-E-POLE": { productType: "mount" },
  "TP3302-E": { productType: "mount" },
  "TQ1003-E": { productType: "mount" },
  "TQ1501-E-CRANE-AND-TRAFFIC": { productType: "mount" },
  "TQ1503-E": { productType: "mount" },
  "TQ3003-SE": { productType: "mount" },
  "TQ3106-SE": { productType: "mount" },
  "TQ3107-SE": { productType: "mount" },
  "TQ5001-E": { productType: "mount" },
  "TQ5301-E": { productType: "mount" },
  "TQ6501-E": { productType: "mount" },

  // Accessories (covers, housings, cables, illuminators, adapters, etc.)
  "TC1705": { productType: "accessory" },
  "TC1706": { productType: "accessory" },
  "TI8605": { productType: "accessory" },
  "TM1804-LE": { productType: "accessory" },
  "TM1901": { productType: "accessory" },
  "TP3826-E": { productType: "accessory" },
  "TP3908-E-EXTENSION-PIPE": { productType: "accessory" },
  "TP4601-E": { productType: "accessory" },
  "TQ1601-E": { productType: "accessory" },
  "TQ1602-E": { productType: "accessory" },
  "TQ1603-E": { productType: "accessory" },
  "TQ1808-VE": { productType: "accessory" },
  "TQ1815-E": { productType: "accessory" },
  "TQ1817-VE": { productType: "accessory" },
  "TQ1818-E": { productType: "accessory" },
  "TQ1819-E": { productType: "accessory" },
  "TQ1902-E": { productType: "accessory" },
  "TQ1915": { productType: "accessory" },
  "TQ1916": { productType: "accessory" },
  "TQ1917": { productType: "accessory" },
  "TQ1918": { productType: "accessory" },
  "TQ1919-E": { productType: "accessory" },
  "TQ1920": { productType: "accessory" },
  "TQ1921": { productType: "accessory" },
  "TQ1925": { productType: "accessory" },
  "TQ1937-E": { productType: "accessory" },
  "TQ1943-E": { productType: "accessory" },
  "TQ1944-E": { productType: "accessory" },
  "TQ1952-E": { productType: "accessory" },
  "TQ3601-E": { productType: "accessory" },
  "TQ3801": { productType: "accessory" },
  "TQ4901": { productType: "accessory" },
  "TQ6802": { productType: "accessory" },
  "TU6004-E": { productType: "accessory" },
  "TU6005-PLENUM": { productType: "accessory" },
  "TU6007-E": { productType: "accessory" },
  "TU9001-CONTROL-BOARD": { productType: "accessory" },
  "TU9004": { productType: "accessory" },

  // Body worn system accessories (NOT cameras)
  "W401": { productType: "accessory" },
  "W700-MK-II": { productType: "accessory" },
  "W701-MK-II": { productType: "accessory" },
  "W702": { productType: "accessory" },
  "W703": { productType: "accessory" },
  "W800": { productType: "accessory" },
};

// ─── CAMERA TYPE FIXES (real cameras stuck as 'specialty') ───────────────────

const cameraTypeFixes = {
  // Modular / sensor units
  "FA1105": "modular",
  "FA1125": "modular",
  "FA3105-L-EYEBALL": "modular",
  "FA4115": "modular",  // Dome sensor unit (had no FPS data)
  "FA51": "modular",
  "FA51-B": "modular",
  "FA54": "modular",

  // Fixed bullet
  "M2035-LE": "fixed-bullet",
  "M2036-LE": "fixed-bullet",

  // Fixed dome
  "M4215-LV": "fixed-dome",
  "M4215-V": "fixed-dome",
  "M4216-LV": "fixed-dome",
  "M4216-V": "fixed-dome",
  "M4218-LV": "fixed-dome",
  "M4218-V": "fixed-dome",
  "M4225-LVE": "fixed-dome",
  "M4227-LVE": "fixed-dome",
  "M4228-LVE": "fixed-dome",
  "Q9216-SLV": "fixed-dome",   // Covert/discreet dome
  "Q9227-SLV": "fixed-dome",   // Covert/discreet dome
  "Q9307-LV": "fixed-dome",    // Compact dome

  // Panoramic / multidirectional
  "M4308-PLE": "panoramic",
  "M4317-PLR": "panoramic",
  "M4317-PLVE": "panoramic",
  "M4318-PLR": "panoramic",
  "M4318-PLVE": "panoramic",
  "M4327-P": "panoramic",
  "M4328-P": "panoramic",
  "P4705-PLVE": "panoramic",
  "P4707-PLVE": "panoramic",
  "P4708-PLVE": "panoramic",
  "P9117-PV": "panoramic",
  "Q4809-PVE": "panoramic",

  // Thermal
  "Q2101-TE": "thermal",
  "Q2111-E": "thermal",
  "Q2112-E": "thermal",

  // Body worn cameras
  "W102": "body-worn",
  "W110": "body-worn",
  "W120": "body-worn",
  "TW1200": "body-worn",

  // Explosion-protected
  "XFQ1656": "explosion-protected",
};

// ─── APPLY CHANGES ───────────────────────────────────────────────────────────

let reclassified = 0;
let cameraFixed = 0;
let notFound = [];

// Apply reclassifications (non-camera products)
for (const [modelKey, changes] of Object.entries(reclassify)) {
  if (!products[modelKey]) {
    notFound.push(modelKey);
    continue;
  }
  products[modelKey].productType = changes.productType;
  // Set cameraType to null (field must exist per AxisProductSpec type)
  products[modelKey].cameraType = null;
  reclassified++;
}

// Apply cameraType fixes (real cameras)
for (const [modelKey, newCameraType] of Object.entries(cameraTypeFixes)) {
  if (!products[modelKey]) {
    notFound.push(modelKey);
    continue;
  }
  products[modelKey].cameraType = newCameraType;
  cameraFixed++;
}

// ─── WRITE RESULT ────────────────────────────────────────────────────────────

fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + "\n");

// ─── REPORT ──────────────────────────────────────────────────────────────────

const allProducts = Object.values(products);
const cameras = allProducts.filter((p) => p.productType === "camera");
const cameraTypes = {};
cameras.forEach((p) => {
  const ct = p.cameraType || "NONE";
  cameraTypes[ct] = (cameraTypes[ct] || 0) + 1;
});

const productTypes = {};
allProducts.forEach((p) => {
  productTypes[p.productType] = (productTypes[p.productType] || 0) + 1;
});

console.log("=== A0 Data Cleanup Complete ===\n");
console.log("Reclassified (non-camera):", reclassified);
console.log("Camera type fixed:", cameraFixed);
if (notFound.length > 0) console.log("NOT FOUND:", notFound);

console.log("\n--- Product Types ---");
Object.entries(productTypes)
  .sort((a, b) => b[1] - a[1])
  .forEach(([k, v]) => console.log("  " + k + ":", v));

console.log("\n--- Camera Subtypes ---");
console.log("Total cameras:", cameras.length);
Object.entries(cameraTypes)
  .sort((a, b) => b[1] - a[1])
  .forEach(([k, v]) => console.log("  " + k + ":", v));

// Verify no specialty cameras remain (except intentional ones)
const remainingSpecialty = cameras.filter((p) => p.cameraType === "specialty");
if (remainingSpecialty.length > 0) {
  console.log("\n--- WARNING: Remaining specialty cameras ---");
  remainingSpecialty.forEach((p) => console.log("  " + p.modelKey + " | " + p.displayName));
}
