/**
 * useAccessory Hook
 *
 * React hook wrapping the core accessory lookup module.
 * Provides getAccessories, getMountsByPlacement, and cart integration helpers.
 */

import { useCallback, useMemo } from 'react';
import type { AccessoryCompatEntry, AccessoryType, PlacementType } from '@/types';
import { getAccessoryLookup } from '@/core/accessory';

// =============================================================================
// TYPES
// =============================================================================

export interface UseAccessoryReturn {
  /** Get all compatible accessories for a camera model */
  getAccessories: (cameraModel: string) => readonly AccessoryCompatEntry[];
  /** Get accessories filtered by type */
  getByType: (cameraModel: string, type: AccessoryType) => readonly AccessoryCompatEntry[];
  /** Get recommended accessories only */
  getRecommended: (cameraModel: string) => readonly AccessoryCompatEntry[];
  /** Get mounts filtered by placement */
  getMountsByPlacement: (cameraModel: string, placement: PlacementType) => readonly AccessoryCompatEntry[];
  /** Check if compatibility data exists for a model */
  hasCompatibility: (cameraModel: string) => boolean;
  /** Whether accessory data is loaded */
  isLoaded: boolean;
}

// =============================================================================
// HOOK
// =============================================================================

export function useAccessory(): UseAccessoryReturn {
  const isLoaded = useMemo(() => {
    try {
      getAccessoryLookup();
      return true;
    } catch {
      return false;
    }
  }, []);

  const getAccessories = useCallback(
    (cameraModel: string): readonly AccessoryCompatEntry[] => {
      try {
        return getAccessoryLookup().getCompatible(cameraModel);
      } catch {
        return [];
      }
    },
    []
  );

  const getByType = useCallback(
    (cameraModel: string, type: AccessoryType): readonly AccessoryCompatEntry[] => {
      try {
        return getAccessoryLookup().getByType(cameraModel, type);
      } catch {
        return [];
      }
    },
    []
  );

  const getRecommended = useCallback(
    (cameraModel: string): readonly AccessoryCompatEntry[] => {
      try {
        return getAccessoryLookup().getRecommended(cameraModel);
      } catch {
        return [];
      }
    },
    []
  );

  const getMountsByPlacement = useCallback(
    (cameraModel: string, placement: PlacementType): readonly AccessoryCompatEntry[] => {
      try {
        return getAccessoryLookup().getMountsByPlacement(cameraModel, placement);
      } catch {
        return [];
      }
    },
    []
  );

  const hasCompatibility = useCallback(
    (cameraModel: string): boolean => {
      try {
        return getAccessoryLookup().hasCompatibility(cameraModel);
      } catch {
        return false;
      }
    },
    []
  );

  return {
    getAccessories,
    getByType,
    getRecommended,
    getMountsByPlacement,
    hasCompatibility,
    isLoaded,
  };
}
