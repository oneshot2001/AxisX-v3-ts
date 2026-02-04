/**
 * Verify Lucide icons import correctly
 */

import { describe, it, expect } from 'vitest';
import { Mic, MicOff, Search, X } from 'lucide-react';

describe('Lucide Icons', () => {
  it('exports required icons', () => {
    expect(Mic).toBeDefined();
    expect(MicOff).toBeDefined();
    expect(Search).toBeDefined();
    expect(X).toBeDefined();
  });
});
