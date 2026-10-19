import { describe, expect, it } from 'vitest';
import { excerpt, readingTime } from './format.js';

describe('blog reading helpers', () => {
  it('estimates a minimum of one minute for short stories', () => {
    expect(readingTime('A short thoughtful story.')).toBe(1);
  });

  it('estimates longer reading time by word count', () => {
    expect(readingTime(Array(401).fill('word').join(' '))).toBe(3);
  });

  it('normalizes whitespace and adds an ellipsis to long excerpts', () => {
    expect(excerpt('A story   with extra spaces', 12)).toBe('A story with…');
  });
});
