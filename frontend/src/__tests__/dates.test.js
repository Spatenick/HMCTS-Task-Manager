import { describe, test, expect } from 'vitest';
import { formatDateTime, isoToLocalInput, localInputToIso, isOverdue } from '../utils/dates';

describe('formatDateTime', () => {
  test('returns empty string for nullish input', () => {
    expect(formatDateTime('')).toBe('');
    expect(formatDateTime(null)).toBe('');
  });
  test('formats a valid ISO string', () => {
    const result = formatDateTime('2026-12-31T17:00:00.000Z');
    // Format varies by locale but should contain year
    expect(result).toMatch(/2026/);
  });
  test('returns input unchanged for invalid date', () => {
    expect(formatDateTime('nonsense')).toBe('nonsense');
  });
});

describe('isoToLocalInput / localInputToIso', () => {
  test('round-trips a date', () => {
    const local = isoToLocalInput('2026-06-15T14:30:00.000Z');
    expect(local).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    const iso = localInputToIso(local);
    expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });
  test('empty input returns empty string', () => {
    expect(isoToLocalInput('')).toBe('');
    expect(localInputToIso('')).toBe('');
  });
});

describe('isOverdue', () => {
  test('past date with PENDING status is overdue', () => {
    expect(isOverdue('2020-01-01T00:00:00Z', 'PENDING')).toBe(true);
  });
  test('future date is not overdue', () => {
    expect(isOverdue('2099-01-01T00:00:00Z', 'PENDING')).toBe(false);
  });
  test('past date but COMPLETED is not overdue', () => {
    expect(isOverdue('2020-01-01T00:00:00Z', 'COMPLETED')).toBe(false);
  });
  test('past date but CANCELLED is not overdue', () => {
    expect(isOverdue('2020-01-01T00:00:00Z', 'CANCELLED')).toBe(false);
  });
});
