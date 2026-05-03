/**
 * Camera image URL resolver.
 *
 * Returns a best-guess Axis product image URL for a given camera model.
 * The slug is the lowercase model with no spaces (hyphens preserved).
 * Example: "P3265-LVE" -> "p3265-lve" -> "https://www.axis.com/images/products/p3265-lve.jpg"
 *
 * No network fetching happens here — we just return a string. The caller's
 * `<img onError>` handler is responsible for swapping in a wireframe SVG
 * placeholder when Axis doesn't have an image at that path.
 */

/**
 * Convert an Axis model number into the URL slug used by axis.com product images.
 * Lowercases, strips whitespace, preserves hyphens.
 */
export function modelToSlug(model: string): string {
  return model.trim().toLowerCase().replace(/\s+/g, '');
}

/**
 * Resolve the primary product image URL for a given Axis model.
 * The caller should attach an onError fallback to the resulting <img>.
 */
export function getCameraImage(model: string): string {
  const slug = modelToSlug(model);
  return `https://www.axis.com/images/products/${slug}.jpg`;
}

/**
 * Inline SVG data URI used as the error fallback for missing camera images.
 * Stylized monochrome dome/bullet camera silhouette on a transparent ground.
 */
export const CAMERA_PLACEHOLDER_SVG: string =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
       <rect x="14" y="34" width="56" height="28" rx="6" />
       <circle cx="42" cy="48" r="8" />
       <circle cx="42" cy="48" r="3" />
       <path d="M70 42 L82 36 L82 60 L70 54 Z" />
       <path d="M14 62 L14 70 M70 62 L70 70" opacity="0.4" />
     </svg>`
  );
