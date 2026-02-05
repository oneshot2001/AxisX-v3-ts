/**
 * Test Setup
 *
 * Configures testing-library and jest-dom matchers for component tests.
 */

import '@testing-library/jest-dom';
import { initMSRP } from '@/core/msrp';

// Initialize MSRP with test data for component tests
initMSRP({
  'P3265-LVE': 1299,
  'P3365-LVE': 1399,
  'Q3538-LVE': 2499,
  'Q6135-LE': 3999,
});
