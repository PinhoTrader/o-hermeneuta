import { beforeEach, describe, expect, it, vi } from 'vitest';
import { canQuery, getQueryCount, incrementQuery, resetQueryCount } from '../services/aiUsageService';

vi.mock('../lib/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  deleteDoc: vi.fn(),
  doc: vi.fn((...segments) => ({ path: segments.join('/') })),
  getDoc: vi.fn(),
  increment: vi.fn((value) => ({ __increment: value })),
  serverTimestamp: vi.fn(() => ({ __serverTimestamp: true })),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
}));

describe('aiUsageService local guest usage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('increments and reads local guest query usage', async () => {
    await expect(getQueryCount('guest_1', 'study-1')).resolves.toBe(0);
    await expect(incrementQuery('guest_1', 'study-1')).resolves.toBe(1);
    await expect(incrementQuery('guest_1', 'study-1')).resolves.toBe(2);

    await expect(getQueryCount('guest_1', 'study-1')).resolves.toBe(2);
  });

  it('checks guest query limits and resets local usage', async () => {
    await incrementQuery('guest_1', 'study-1');
    await incrementQuery('guest_1', 'study-1');

    await expect(canQuery('guest_1', 'study-1', 2)).resolves.toBe(false);
    await resetQueryCount('guest_1', 'study-1');
    await expect(canQuery('guest_1', 'study-1', 2)).resolves.toBe(true);
  });
});
