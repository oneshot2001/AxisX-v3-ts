/**
 * Batch Mount Pairer
 *
 * Orchestrates mount pairing across a batch of search results.
 * For each item with a mountType, resolves the best compatible
 * Axis mount and attaches a MountPairingResult.
 *
 * Pure function — no side effects, testable in isolation.
 */

import type {
  BatchSearchItem,
  CompetitorMapping,
  LegacyAxisMapping,
  MountPairingResult,
  PlacementType,
  CameraSubcategory,
} from '@/types';
import { getAccessoryLookup, getFormFactorDefaults } from '@/core/accessory';

/**
 * Resolve a mount pairing for a single camera + placement.
 * Returns a MountPairingResult with confidence tracking.
 */
export function resolveMountPairWithConfidence(
  cameraModel: string,
  placement: PlacementType,
  cameraType?: CameraSubcategory | null
): MountPairingResult {
  const lookup = getAccessoryLookup();

  // Try resolving with confidence tracking
  const { entry, confidence, warning } = lookup.resolveWithConfidence(cameraModel);

  if (entry) {
    // Filter mounts by placement from the resolved entry
    const mounts = entry.accessories.filter(
      (a) => a.accessoryType === 'mount' && a.mountPlacement === placement
    );

    if (mounts.length > 0) {
      // Sort by priority: recommended > included > compatible, then prefer no-additional
      const sorted = [...mounts].sort((a, b) => {
        const recPriority: Record<string, number> = {
          recommended: 3,
          included: 2,
          compatible: 1,
        };
        const recDiff =
          (recPriority[b.recommendation] ?? 0) - (recPriority[a.recommendation] ?? 0);
        if (recDiff !== 0) return recDiff;
        if (a.requiresAdditional !== b.requiresAdditional) {
          return a.requiresAdditional ? 1 : -1;
        }
        return 0;
      });

      return {
        cameraModel,
        mount: sorted[0] ?? null,
        mountConfidence: confidence,
        mountWarning: warning,
      };
    }
  }

  // Form factor default: suggest a mount based on camera type
  if (cameraType) {
    const defaultPlacements = getFormFactorDefaults(cameraType);
    if (defaultPlacements.includes(placement)) {
      return {
        cameraModel,
        mount: null,
        mountConfidence: 'form-factor-default',
        mountWarning: `No specific mount data for ${cameraModel}. ${cameraType} cameras typically use ${placement} mounts.`,
      };
    }
  }

  // No match at all
  return {
    cameraModel,
    mount: null,
    mountConfidence: 'none',
    mountWarning: `No compatible ${placement} mount found for ${cameraModel}.`,
  };
}

/**
 * Pair mounts for a batch of search items.
 *
 * For each item with a mountType and a successful cross-reference result,
 * resolves the best compatible mount and attaches the MountPairingResult.
 *
 * Items without mountType or without a search result are returned unchanged.
 */
export function pairMountsForBatch(items: BatchSearchItem[]): BatchSearchItem[] {
  return items.map((item) => {
    // Skip items without mount type
    if (!item.mountType) return item;

    // Skip items with failed cross-reference (no search result)
    if (!item.response?.results?.[0]) return item;

    const mapping = item.response.results[0].mapping;
    const axisModel = 'axis_replacement' in mapping
      ? (mapping as CompetitorMapping).axis_replacement
      : (mapping as LegacyAxisMapping).replacement_model;
    const cameraType: CameraSubcategory | null = null;

    const mountPairing = resolveMountPairWithConfidence(
      axisModel,
      item.mountType,
      cameraType
    );

    return { ...item, mountPairing };
  });
}
