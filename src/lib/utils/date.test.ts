import { describe, it, expect } from 'vitest';
import { formatDate, formatTime, formatRelative } from '$lib/utils/date';

describe('formatDate', () => {
  it('returns a human-readable date string', () => {
    const result = formatDate('2024-01-15T10:30:00Z');
    expect(result).toBeTypeOf('string');
    expect(result.length).toBeGreaterThan(0);
    // Should contain "Jan" or similar month abbreviation
    expect(result).toMatch(/Jan/);
  });

  it('includes year, month, and day', () => {
    const result = formatDate('2024-06-20T00:00:00Z');
    expect(result).toMatch(/2024/);
  });
});

describe('formatTime', () => {
  it('returns a time string with AM/PM or HH:MM format', () => {
    const result = formatTime('2024-01-15T14:30:00Z');
    expect(result).toBeTypeOf('string');
    // Should contain a colon separating hours and minutes
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });

  it('returns a non-empty string for valid ISO string', () => {
    const result = formatTime('2024-01-15T09:05:00Z');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('formatRelative', () => {
  it('returns "just now" for very recent timestamps', () => {
    const now = new Date().toISOString();
    expect(formatRelative(now)).toBe('just now');
  });

  it('returns "Xm ago" for timestamps within the last hour', () => {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    expect(formatRelative(thirtyMinutesAgo)).toBe('30m ago');
  });

  it('returns "Xh ago" for timestamps within the last day', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(formatRelative(threeHoursAgo)).toBe('3h ago');
  });

  it('returns "Xd ago" for timestamps within the last week', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelative(twoDaysAgo)).toBe('2d ago');
  });

  it('returns a formatted date for timestamps older than a week', () => {
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const result = formatRelative(twoWeeksAgo);
    // Should be a date string, not a relative time
    expect(result).not.toMatch(/ago/);
    expect(result).toBeTypeOf('string');
    expect(result.length).toBeGreaterThan(0);
  });
});
